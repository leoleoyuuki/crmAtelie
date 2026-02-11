
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
  setDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, Customer, OrderItem, PriceTableItem, Material, UsedMaterial, Purchase, UserSummary, FixedCost } from '@/lib/types';
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
    
    if (data.userId !== user.uid) {
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
        throw serverError;
    });

  const newDoc = await getDoc(docRef);
  return fromFirebase(newDoc.data(), newDoc.id) as Customer;
}

export async function updateCustomer(customerId: string, customer: Partial<Omit<Customer, 'id' | 'createdAt' | 'userId'>>): Promise<Customer> {
    const docRef = doc(db, 'customers', customerId);
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

export function getServiceDistributionData(distribution: Record<string, number> = {}) {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([service, count], index) => ({
        service,
        count,
        fill: colors[index % colors.length]
    }))
    .sort((a, b) => b.count - a.count);
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
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const newOrderData = {
        ...order,
        userId: user.uid,
        createdAt: serverTimestamp(),
        dueDate: Timestamp.fromDate(order.dueDate),
    };

    try {
        await runTransaction(db, async (transaction) => {
            const orderRef = doc(collection(db, 'orders'));
            transaction.set(orderRef, newOrderData);

            const summaryRef = doc(db, 'summaries', user.uid);
            
            const summaryUpdates: any = {
                totalOrders: increment(1),
                pendingOrders: increment(1),
            };

            // Distribution Map Increments
            const distMap: Record<string, number> = {};
            order.items.forEach(item => {
                const type = item.serviceType || 'Outros';
                distMap[type] = (distMap[type] || 0) + 1;
            });

            Object.entries(distMap).forEach(([type, count]) => {
                summaryUpdates[`serviceDistribution.${type}`] = increment(count);
            });

            transaction.set(summaryRef, summaryUpdates, { merge: true });
        });
    } catch (error) {
        console.error("Add order transaction failed: ", error);
        throw new Error("Falha ao criar o pedido. Tente novamente.");
    }
}


export async function updateOrder(orderId: string, updatedData: Partial<Omit<Order, 'id' | 'createdAt' | 'userId'>>) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const orderRef = doc(db, 'orders', orderId);
    const summaryRef = doc(db, 'summaries', user.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists()) {
                throw new Error("Pedido não encontrado.");
            }

            const currentOrder = fromFirebase(orderDoc.data(), orderDoc.id) as Order;
            const currentStatus = currentOrder.status;
            const newStatus = updatedData.status;

            // --- 1. Handle Service Distribution Changes if items updated ---
            if (updatedData.items) {
                const currentDist: Record<string, number> = {};
                currentOrder.items.forEach(item => {
                    const type = item.serviceType || 'Outros';
                    currentDist[type] = (currentDist[type] || 0) + 1;
                });

                const newDist: Record<string, number> = {};
                updatedData.items.forEach(item => {
                    const type = item.serviceType || 'Outros';
                    newDist[type] = (newDist[type] || 0) + 1;
                });

                const distUpdates: any = {};
                const allKeys = new Set([...Object.keys(currentDist), ...Object.keys(newDist)]);
                
                allKeys.forEach(type => {
                    const diff = (newDist[type] || 0) - (currentDist[type] || 0);
                    if (diff !== 0) {
                        distUpdates[`serviceDistribution.${type}`] = increment(diff);
                    }
                });

                if (Object.keys(distUpdates).length > 0) {
                    transaction.set(summaryRef, distUpdates, { merge: true });
                }
            }

            // --- 2. Handle status change logic ---
            if (currentStatus === 'Concluído' && newStatus && newStatus !== 'Concluído') {
                const orderMonthKey = format(currentOrder.createdAt, 'yyyy-MM');
                const revenueDecrement = currentOrder.totalValue;

                transaction.set(summaryRef, {
                    totalRevenue: increment(-revenueDecrement),
                    pendingOrders: increment(1),
                    monthlyRevenue: {
                        [orderMonthKey]: increment(-revenueDecrement)
                    }
                }, { merge: true });

                if (currentOrder.materialsUsed && currentOrder.materialsUsed.length > 0) {
                    for (const used of currentOrder.materialsUsed) {
                        const materialRef = doc(db, 'materials', used.materialId);
                        transaction.update(materialRef, {
                            stock: increment(used.quantityUsed),
                            usedInOrders: increment(-1)
                        });
                    }
                }
                
                 transaction.update(orderRef, { ...updatedData, materialsUsed: [] });

            } else {
                const updatePayload: any = { ...updatedData };
                if (updatedData.dueDate && !(updatedData.dueDate instanceof Timestamp)) {
                    updatePayload.dueDate = Timestamp.fromDate(updatedData.dueDate);
                }
                 transaction.update(orderRef, updatePayload);
            }
        });

    } catch (error) {
        console.error("Update order transaction failed: ", error);
        throw new Error("Falha ao atualizar o pedido.");
    }
    
    const updatedDoc = await getDoc(orderRef);
    return fromFirebase(updatedDoc.data(), updatedDoc.id) as Order;
}


export async function deleteOrder(orderId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const orderRef = doc(db, 'orders', orderId);
    const summaryRef = doc(db, 'summaries', user.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists()) {
                throw new Error("Pedido não encontrado.");
            }

            const orderData = fromFirebase(orderDoc.data(), orderDoc.id) as Order;
            const revenueDecrement = orderData.totalValue;
            const orderMonthKey = format(orderData.createdAt, 'yyyy-MM');

            const summaryUpdate: any = {
                totalOrders: increment(-1),
            };

            if (orderData.status === 'Concluído') {
                summaryUpdate.totalRevenue = increment(-revenueDecrement);
                summaryUpdate.monthlyRevenue = { [orderMonthKey]: increment(-revenueDecrement) };
            } else {
                summaryUpdate.pendingOrders = increment(-1);
            }

            // Decrement Distribution
            if (orderData.items) {
                const distMap: Record<string, number> = {};
                orderData.items.forEach(item => {
                    const type = item.serviceType || 'Outros';
                    distMap[type] = (distMap[type] || 0) + 1;
                });
                Object.entries(distMap).forEach(([type, count]) => {
                    summaryUpdate[`serviceDistribution.${type}`] = increment(-count);
                });
            }

            transaction.set(summaryRef, summaryUpdate, { merge: true });

            if (orderData.materialsUsed && orderData.materialsUsed.length > 0) {
                 for (const used of orderData.materialsUsed) {
                    const materialRef = doc(db, 'materials', used.materialId);
                    transaction.update(materialRef, {
                        stock: increment(used.quantityUsed),
                        usedInOrders: increment(-1)
                    });
                }
            }
            
            transaction.delete(orderRef);
        });
    } catch (error) {
        console.error("Delete order transaction failed: ", error);
        throw new Error("Falha ao excluir o pedido.");
    }
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

    const rawMaterialName = purchaseData.materialName.trim();
    if (!rawMaterialName) throw new Error("O nome do material não pode ser vazio.");
    
    const standardizedMaterialName = rawMaterialName.charAt(0).toUpperCase() + rawMaterialName.slice(1).toLowerCase();
    const standardizedPurchaseData = { ...purchaseData, materialName: standardizedMaterialName };

    await runTransaction(db, async (transaction) => {
        const purchaseMonthKey = format(new Date(), 'yyyy-MM');
        const costIncrement = standardizedPurchaseData.cost;

        const newPurchaseData = {
            ...standardizedPurchaseData,
            userId: user.uid,
            createdAt: serverTimestamp(),
        };
        const purchaseRef = doc(collection(db, 'purchases'));
        transaction.set(purchaseRef, newPurchaseData);

        const summaryRef = doc(db, 'summaries', user.uid);
        transaction.set(summaryRef, {
            monthlyCosts: {
                [purchaseMonthKey]: increment(costIncrement)
            }
        }, { merge: true });

        const materialQuery = query(
            collection(db, 'materials'),
            where('name', '==', standardizedMaterialName),
            where('userId', '==', user.uid)
        );
        
        const materialSnapshot = await getDocs(materialQuery);

        if (materialSnapshot.empty) {
            const newMaterialRef = doc(collection(db, 'materials'));
            const costPerUnit = standardizedPurchaseData.quantity > 0 ? standardizedPurchaseData.cost / standardizedPurchaseData.quantity : 0;
            transaction.set(newMaterialRef, {
                name: standardizedMaterialName,
                unit: standardizedPurchaseData.unit,
                stock: standardizedPurchaseData.quantity,
                costPerUnit: costPerUnit,
                createdAt: serverTimestamp(),
                userId: user.uid,
                usedInOrders: 0,
            });
        } else {
            const materialDocRef = materialSnapshot.docs[0].ref;
            transaction.update(materialDocRef, {
                stock: increment(standardizedPurchaseData.quantity),
            });
        }
    }).catch(error => {
        console.error("Transaction failed: ", error);
        throw new Error("Falha ao registrar compra e atualizar estoque.");
    });
}


export async function deletePurchase(purchaseId: string): Promise<{ success: boolean }> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const purchaseRef = doc(db, 'purchases', purchaseId);
    const summaryRef = doc(db, 'summaries', user.uid);

    await runTransaction(db, async (transaction) => {
        const purchaseDoc = await transaction.get(purchaseRef);
        if (!purchaseDoc.exists()) {
            throw new Error("Registro de compra não encontrado.");
        }
        
        const purchaseData = fromFirebase(purchaseDoc.data(), purchaseId) as Purchase;
        const purchaseMonthKey = format(purchaseData.createdAt, 'yyyy-MM');
        const costDecrement = purchaseData.cost;

        transaction.set(summaryRef, {
            monthlyCosts: {
                [purchaseMonthKey]: increment(-costDecrement)
            }
        }, { merge: true });

        transaction.delete(purchaseRef);

    }).catch(error => {
        console.error("Delete purchase transaction failed: ", error);
        throw new Error("Falha ao excluir o registro da compra.");
    });
    
    return { success: true };
}


// Fixed Cost Functions
export async function addFixedCost(costData: Omit<FixedCost, 'id' | 'userId'>) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    await runTransaction(db, async (transaction) => {
        const costMonthKey = format(costData.date, 'yyyy-MM');
        const costIncrement = costData.cost;

        const newCostData = {
            ...costData,
            userId: user.uid,
            date: Timestamp.fromDate(costData.date),
        };
        const costRef = doc(collection(db, 'fixedCosts'));
        transaction.set(costRef, newCostData);

        const summaryRef = doc(db, 'summaries', user.uid);
        transaction.set(summaryRef, {
            monthlyCosts: {
                [costMonthKey]: increment(costIncrement)
            }
        }, { merge: true });
    }).catch(error => {
        console.error("Add fixed cost transaction failed: ", error);
        throw new Error("Falha ao registrar custo fixo.");
    });
}

export async function deleteFixedCost(costId: string): Promise<{ success: boolean }> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const costRef = doc(db, 'fixedCosts', costId);
    const summaryRef = doc(db, 'summaries', user.uid);

    await runTransaction(db, async (transaction) => {
        const costDoc = await transaction.get(costRef);
        if (!costDoc.exists()) {
            throw new Error("Registro de custo não encontrado.");
        }
        
        const costData = fromFirebase(costDoc.data(), costId) as FixedCost;
        const costMonthKey = format(costData.date, 'yyyy-MM');
        const costDecrement = costData.cost;

        transaction.set(summaryRef, {
            monthlyCosts: {
                [costMonthKey]: increment(-costDecrement)
            }
        }, { merge: true });

        transaction.delete(costRef);
    }).catch(error => {
        console.error("Delete fixed cost transaction failed: ", error);
        throw new Error("Falha ao excluir o registro do custo.");
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

export function getRevenueChartDataFromSummary(summary: UserSummary) {
    const data: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        
        data.push({
            month: format(monthDate, 'MMM', { locale: ptBR }),
            revenue: summary.monthlyRevenue[monthKey] || 0,
        });
    }
    return data;
}

export function getCostChartDataFromSummary(summary: UserSummary) {
    const data: { month: string; cost: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        
        data.push({
            month: format(monthDate, 'MMM', { locale: ptBR }),
            cost: summary.monthlyCosts?.[monthKey] || 0,
        });
    }
    return data;
}

export function getProfitChartDataFromSummary(summary: UserSummary) {
    const data: { month: string; revenue: number; cost: number; profit: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        
        const revenue = summary.monthlyRevenue[monthKey] || 0;
        const cost = summary.monthlyCosts?.[monthKey] || 0;
        const profit = revenue - cost;

        data.push({
            month: format(monthDate, 'MMM', { locale: ptBR }),
            revenue,
            cost,
            profit,
        });
    }
    return data;
}


// Order Conclusion
export async function concludeOrderWithStockUpdate(orderId: string, usedMaterials: UsedMaterial[]) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
        await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, 'orders', orderId);
            const summaryRef = doc(db, 'summaries', user.uid);
            
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists()) {
                throw new Error("Pedido não encontrado.");
            }
            const orderData = orderDoc.data() as Order;

            const materialRefs = usedMaterials.map(used => doc(db, 'materials', used.materialId));
            const materialDocs = await Promise.all(materialRefs.map(ref => transaction.get(ref)));

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
            
            const orderMonthKey = format(new Date(), 'yyyy-MM');
            const revenueIncrement = orderData.totalValue;

            transaction.set(summaryRef, {
                totalRevenue: increment(revenueIncrement),
                pendingOrders: increment(-1),
                monthlyRevenue: {
                    [orderMonthKey]: increment(revenueIncrement)
                }
            }, { merge: true });


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


// Dashboard Summary Migration
export async function getOrCreateUserSummary(userId: string): Promise<UserSummary> {
    const summaryRef = doc(db, 'summaries', userId);
    const summarySnap = await getDoc(summaryRef);

    if (summarySnap.exists() && summarySnap.data()?.serviceDistribution) {
        return fromFirebase(summarySnap.data(), summarySnap.id) as UserSummary;
    }

    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
    const purchasesQuery = query(collection(db, 'purchases'), where('userId', '==', userId));
    
    const [ordersSnapshot, purchasesSnapshot] = await Promise.all([
        getDocs(ordersQuery),
        getDocs(purchasesQuery)
    ]);
    
    let totalRevenue = 0;
    let totalOrders = 0;
    let pendingOrders = 0;
    const monthlyRevenue: { [key: string]: number } = {};
    const monthlyCosts: { [key: string]: number } = {};
    const serviceDistribution: { [key: string]: number } = {};

    ordersSnapshot.forEach(orderDoc => {
        const order = fromFirebase(orderDoc.data(), orderDoc.id) as Order;
        totalOrders++;

        if (order.items) {
            order.items.forEach(item => {
                const type = item.serviceType || 'Outros';
                serviceDistribution[type] = (serviceDistribution[type] || 0) + 1;
            });
        }

        if (order.status === 'Concluído') {
            totalRevenue += order.totalValue;
            const monthKey = format(order.createdAt, 'yyyy-MM');
            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.totalValue;
        } else if (order.status === 'Novo' || order.status === 'Em Processo') {
            pendingOrders++;
        }
    });

     purchasesSnapshot.forEach(purchaseDoc => {
        const purchase = fromFirebase(purchaseDoc.data(), 'temp-id') as Purchase;
        const monthKey = format(purchase.createdAt, 'yyyy-MM');
        monthlyCosts[monthKey] = (monthlyCosts[monthKey] || 0) + purchase.cost;
    });


    const newSummaryData = {
        userId,
        totalRevenue,
        totalOrders,
        pendingOrders,
        monthlyRevenue,
        monthlyCosts,
        serviceDistribution,
    };

    await setDoc(summaryRef, newSummaryData, { merge: true });

    return { id: userId, ...newSummaryData };
}

export async function setUserPrivacyPassword(userId: string, passwordHash: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { passwordHash })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { passwordHash: '***' },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export async function updateUserProfilePhone(userId: string, phone: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { phone })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { phone },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
