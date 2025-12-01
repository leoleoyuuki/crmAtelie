
'use client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  Timestamp,
  writeBatch,
  getDoc,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, ServiceType, Customer, OrderItem, PriceTableItem, Material, UsedMaterial, Purchase } from '@/lib/types';
import { subMonths, format, startOfMonth, endOfMonth, subDays, getYear, getMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auth } from '@/firebase/config';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


const fromFirebase = (docData: any, id: string) => {
    if (!docData) return null;
    const data = { ...docData, id };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    }
    return data;
};


// Customer Functions
const customersCollection = collection(db, 'customers');

export async function getCustomers(): Promise<Customer[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(customersCollection, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirebase(doc.data(), doc.id) as Customer);
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const docRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    const data = fromFirebase(docSnap.data(), docSnap.id) as Customer;
    
    // Security check: ensure the fetched customer belongs to the current user
    if (data.userId !== user.uid) {
        // You can throw an error or return null based on your app's security policy
        console.error("Permission denied: User trying to access another user's customer.");
        return null;
    }
    return data;
}


export async function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'userId'>): Promise<Customer> {
  if (!auth.currentUser) throw new Error("Usuário não autenticado.");
  const newCustomerData = {
      ...customer,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(customersCollection, newCustomerData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: customersCollection.path,
            operation: 'create',
            requestResourceData: newCustomerData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw to allow the caller to handle UI state
    });

  const newDoc = await getDoc(docRef);
  return fromFirebase(newDoc.data(), newDoc.id) as Customer;
}

export async function updateCustomer(customerId: string, customer: Partial<Omit<Customer, 'id' | 'createdAt' | 'userId'>>): Promise<Customer> {
    const docRef = doc(db, 'customers', customerId);
    // TODO: Add a check to ensure the user owns this document before updating.
    await updateDoc(docRef, customer)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: customer,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
    const updatedDoc = await getDoc(docRef);
    return fromFirebase(updatedDoc.data(), updatedDoc.id) as Customer;
}

export async function deleteCustomer(customerId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const ordersQuery = query(collection(db, 'orders'), where('customerId', '==', customerId), where('userId', '==', user.uid));
    const ordersSnapshot = await getDocs(ordersQuery);
    if (!ordersSnapshot.empty) {
        throw new Error("Não é possível excluir clientes com pedidos existentes.");
    }
    const docRef = doc(db, 'customers', customerId);
    // TODO: Add a check to ensure the user owns this document before deleting.
    await deleteDoc(docRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });

    return { success: true };
}


// Order Functions
const ordersCollection = collection(db, 'orders');

export async function getOrderById(orderId: string): Promise<Order | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
     const data = fromFirebase(docSnap.data(), docSnap.id) as Order;
    // Security check: ensure the fetched order belongs to the current user
    if (data.userId !== user.uid) {
        console.error("Permission denied: User trying to access another user's order.");
        return null;
    }
    return data;
}


export async function getOrders(): Promise<Order[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(ordersCollection, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirebase(doc.data(), doc.id) as Order);
}

export function getStatusMetrics(orders: Order[]) {
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status === 'Concluído')
    .reduce((sum, o) => sum + o.totalValue, 0);
  const pendingCount = orders.filter(o => o.status === 'Novo' || o.status === 'Em Processo').length;
  
  return { totalOrders, totalRevenue, pendingCount };
}

const getMonthlyData = (orders: Order[], reducer: (acc: number, order: Order) => number) => {
    const data: { month: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const value = orders
            .filter(o => {
                const createdAt = o.createdAt;
                return createdAt && isValid(createdAt) && createdAt >= monthStart && createdAt <= monthEnd;
            })
            .reduce(reducer, 0);

        data.push({
            month: format(monthDate, 'MMM', { locale: ptBR }),
            value: Math.round(value),
        });
    }
    return data;
}


export function getRevenueLast6Months(orders: Order[]) {
  const revenueReducer = (sum: number, order: Order) => {
    if (order.status === 'Concluído') {
      return sum + order.totalValue;
    }
    return sum;
  };
  const data = getMonthlyData(orders, revenueReducer).map(item => ({ month: item.month, revenue: item.value }));
  return data;
}

export function getOrdersLast6Months(orders: Order[]) {
    const orderCountReducer = (count: number, order: Order) => count + 1;
    const data = getMonthlyData(orders, orderCountReducer).map(item => ({ month: item.month, orders: item.value }));
    return data;
}

export function getServiceDistribution(orders: Order[]) {
  const now = new Date();
  const last30Days = subDays(now, 30);
  const recentOrders = orders.filter(o => {
      const createdAt = o.createdAt;
      return createdAt && isValid(createdAt) && createdAt >= last30Days
  });
  
  const distribution = recentOrders.reduce((acc, order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        acc[item.serviceType] = (acc[item.serviceType] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<ServiceType, number>);

  const serviceTypeToChartMap: Record<ServiceType, number> = {
    "Ajuste": 1,
    "Design Personalizado": 2,
    "Reparo": 3,
    "Lavagem a Seco": 4
  }

  return Object.entries(distribution).map(([service, count]) => ({
    service,
    count,
    fill: `var(--chart-${serviceTypeToChartMap[service as ServiceType] || Object.keys(distribution).indexOf(service) + 1})`
  }));
}

export function getMonths() {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = subMonths(now, i);
        months.push({
            value: `${getMonth(date)}-${getYear(date)}`,
            label: format(date, 'MMMM yyyy', { locale: ptBR })
        });
    }
    return months;
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'userId'>) {
  if (!auth.currentUser) throw new Error("Usuário não autenticado.");
  const newOrderData = {
      ...order,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      dueDate: Timestamp.fromDate(order.dueDate),
  };
  const docRef = await addDoc(ordersCollection, newOrderData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: ordersCollection.path,
            operation: 'create',
            requestResourceData: newOrderData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  const newDoc = await getDoc(docRef);
  return fromFirebase(newDoc.data(), newDoc.id) as Order;
}

export async function updateOrder(orderId: string, updatedData: Partial<Omit<Order, 'id' | 'createdAt' | 'userId'>>) {
  const docRef = doc(db, 'orders', orderId);
  const updatePayload: any = { ...updatedData };

  if (updatedData.dueDate && !(updatedData.dueDate instanceof Timestamp)) {
    updatePayload.dueDate = Timestamp.fromDate(updatedData.dueDate);
  }

  // TODO: Add a check to ensure the user owns this document before updating.
  await updateDoc(docRef, updatePayload)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updatePayload,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  
  const updatedDoc = await getDoc(docRef);
  return fromFirebase(updatedDoc.data(), updatedDoc.id) as Order;
}

export async function deleteOrder(orderId: string) {
  const docRef = doc(db, 'orders', orderId);
  // TODO: Add a check to ensure the user owns this document before deleting.
  await deleteDoc(docRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  return { success: true };
}


// Price Table Functions
const priceTableCollection = collection(db, 'priceTable');

export async function getPriceTableItems(): Promise<PriceTableItem[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(priceTableCollection, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirebase(doc.data(), doc.id) as PriceTableItem);
}

export async function addPriceTableItem(item: Omit<PriceTableItem, 'id' | 'userId'>): Promise<PriceTableItem> {
  if (!auth.currentUser) throw new Error("Usuário não autenticado.");
  const newItemData = {
    ...item,
    userId: auth.currentUser.uid,
  };
  const docRef = await addDoc(priceTableCollection, newItemData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: priceTableCollection.path,
            operation: 'create',
            requestResourceData: newItemData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  const newDoc = await getDoc(docRef);
  return fromFirebase(newDoc.data(), newDoc.id) as PriceTableItem;
}

export async function updatePriceTableItem(itemId: string, item: Partial<Omit<PriceTableItem, 'id' | 'userId'>>): Promise<PriceTableItem> {
  const docRef = doc(db, 'priceTable', itemId);
  // TODO: Add a check to ensure the user owns this document before updating.
  await updateDoc(docRef, item)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: item,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  const updatedDoc = await getDoc(docRef);
  return fromFirebase(updatedDoc.data(), updatedDoc.id) as PriceTableItem;
}

export async function deletePriceTableItem(itemId: string): Promise<{ success: boolean }> {
  const docRef = doc(db, 'priceTable', itemId);
  // TODO: Add a check to ensure the user owns this document before deleting.
  await deleteDoc(docRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  return { success: true };
}


// Material Functions
const materialsCollection = collection(db, 'materials');

export async function getMaterials(): Promise<Material[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(materialsCollection, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirebase(doc.data(), doc.id) as Material);
}

export async function updateMaterial(materialId: string, material: Partial<Omit<Material, 'id' | 'userId' | 'createdAt'>>): Promise<Material> {
    const docRef = doc(db, 'materials', materialId);
    await updateDoc(docRef, material)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: material,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
    const updatedDoc = await getDoc(docRef);
    return fromFirebase(updatedDoc.data(), updatedDoc.id) as Material;
}

export async function deleteMaterial(materialId: string): Promise<{ success: boolean }> {
    const docRef = doc(db, 'materials', materialId);
    await deleteDoc(docRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
    return { success: true };
}


// Purchase Functions
const purchasesCollection = collection(db, 'purchases');

export async function addPurchase(purchaseData: Omit<Purchase, 'id' | 'userId' | 'createdAt'>) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    await runTransaction(db, async (transaction) => {
        // 1. Create the immutable purchase record
        const newPurchaseData = {
            ...purchaseData,
            userId: user.uid,
            createdAt: serverTimestamp(),
        };
        const purchaseRef = doc(collection(db, 'purchases'));
        transaction.set(purchaseRef, newPurchaseData);

        // 2. Find and update the corresponding material in the inventory
        const materialQuery = query(
            collection(db, 'materials'),
            where('name', '==', purchaseData.materialName),
            where('userId', '==', user.uid)
        );
        
        const materialSnapshot = await getDocs(materialQuery); // Execute query outside transaction if possible, but for consistency we do it inside.

        if (materialSnapshot.empty) {
            // Material doesn't exist, create it
            const newMaterialRef = doc(collection(db, 'materials'));
            const costPerUnit = purchaseData.quantity > 0 ? purchaseData.cost / purchaseData.quantity : 0;
            transaction.set(newMaterialRef, {
                name: purchaseData.materialName,
                unit: purchaseData.unit,
                stock: purchaseData.quantity,
                costPerUnit: costPerUnit,
                userId: user.uid,
                createdAt: serverTimestamp(),
                usedInOrders: 0,
            });
        } else {
            // Material exists, update its stock
            const materialDocRef = materialSnapshot.docs[0].ref;
            transaction.update(materialDocRef, {
                stock: increment(purchaseData.quantity),
                // Optionally update costPerUnit if needed, e.g., to an average
            });
        }
    }).catch(error => {
        // This will catch transaction-specific errors.
        // We can re-throw a more generic error or handle it.
        console.error("Transaction failed: ", error);
        // Emitting a permission error here might be complex as it could be a transaction failure, not just permissions.
        // For simplicity, we just re-throw.
        throw new Error("Falha ao registrar compra e atualizar estoque.");
    });
}


export async function deletePurchase(purchaseId: string): Promise<{ success: boolean }> {
  const docRef = doc(db, 'purchases', purchaseId);
  await deleteDoc(docRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  return { success: true };
}

// Cost Analytics
export function getMonthlyCostByCategory(purchases: Purchase[], month: number, year: number) {
    const monthlyPurchases = purchases.filter(p => {
        const createdAt = p.createdAt;
        return createdAt && isValid(createdAt) && getMonth(createdAt) === month && getYear(createdAt) === year;
    });

    const costs = monthlyPurchases.reduce((acc, purchase) => {
        if (purchase.category) {
            if (!acc[purchase.category]) {
                acc[purchase.category] = 0;
            }
            acc[purchase.category] += purchase.cost;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(costs).map(([name, cost]) => ({
        name,
        cost
    }));
}

export function getInventoryValue(materials: Material[]) {
  if (!materials) return 0;
  return materials.reduce((acc, material) => acc + (material.stock * (material.costPerUnit || 0)), 0);
}

export function getMonthlyCostOfGoodsSold(orders: Order[], month: number, year: number) {
    const monthlyOrders = orders.filter(o => {
        const createdAt = o.createdAt;
        return o.status === 'Concluído' && createdAt && isValid(createdAt) && getMonth(createdAt) === month && getYear(createdAt) === year;
    });

    // This is a simplified calculation. A real-world scenario would be much more complex,
    // requiring historical cost data for each material.
    const totalCost = monthlyOrders.reduce((acc, order) => {
        if (order.materialsUsed) {
            // Here we would ideally get the cost of the material at the time of use.
            // For simplicity, we can't do that without significant data model changes.
            // This will be inaccurate if material costs change.
        }
        return acc;
    }, 0);

    return totalCost;
}


// Order Conclusion
export async function concludeOrderWithStockUpdate(orderId: string, usedMaterials: UsedMaterial[]) {
    if (!auth.currentUser) throw new Error("Usuário não autenticado.");

    try {
        await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, 'orders', orderId);
            
            // 1. All reads first
            const materialRefs = usedMaterials.map(used => doc(db, 'materials', used.materialId));
            const materialDocs = await Promise.all(materialRefs.map(ref => transaction.get(ref)));

            // 2. All writes last
            for (let i = 0; i < usedMaterials.length; i++) {
                const materialDoc = materialDocs[i];
                const used = usedMaterials[i];

                if (!materialDoc.exists()) {
                    throw new Error(`Material com ID ${used.materialId} não encontrado.`);
                }

                const currentStock = materialDoc.data().stock;
                const newStock = currentStock - used.quantityUsed;

                if (newStock < 0) {
                    throw new Error(`Estoque insuficiente para ${materialDoc.data().name}.`);
                }

                transaction.update(materialRefs[i], {
                    stock: newStock,
                    usedInOrders: increment(1)
                });
            }

            // Update the order after all material updates are staged
            transaction.update(orderRef, {
                status: 'Concluído',
                materialsUsed: usedMaterials,
            });
        });
    } catch (error: any) {
        console.error("Transaction failed: ", error);
        throw error;
    }
}
