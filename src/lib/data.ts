
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
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, ServiceType, Customer, OrderItem, PriceTableItem } from '@/lib/types';
import { subMonths, format, startOfMonth, endOfMonth, subDays, getYear, getMonth } from 'date-fns';
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
  const q = query(customersCollection, where("userId", "==", auth.currentUser?.uid || ''));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirebase(doc.data(), doc.id) as Customer);
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
    const docRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    const data = fromFirebase(docSnap.data(), docSnap.id) as Customer;
    if (data.userId !== auth.currentUser?.uid) {
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
    const ordersQuery = query(collection(db, 'orders'), where('customerId', '==', customerId), where('userId', '==', auth.currentUser?.uid));
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
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
     const data = fromFirebase(docSnap.data(), docSnap.id) as Order;
    if (data.userId !== auth.currentUser?.uid) {
        return null;
    }
    return data;
}


export async function getOrders(): Promise<Order[]> {
  if (!auth.currentUser) return [];
  const q = query(ordersCollection, where("userId", "==", auth.currentUser.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirebase(doc.data(), doc.id) as Order);
}

export async function getStatusMetrics(orders: Order[]) {
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
            .filter(o => o.createdAt >= monthStart && o.createdAt <= monthEnd)
            .reduce(reducer, 0);

        data.push({
            month: format(monthDate, 'MMM', { locale: ptBR }),
            value: Math.round(value),
        });
    }
    return data;
}


export async function getRevenueLast6Months(orders: Order[]) {
  const revenueReducer = (sum: number, order: Order) => {
    if (order.status === 'Concluído') {
      return sum + order.totalValue;
    }
    return sum;
  };
  const data = getMonthlyData(orders, revenueReducer).map(item => ({ month: item.month, revenue: item.value }));
  return data;
}

export async function getOrdersLast6Months(orders: Order[]) {
    const orderCountReducer = (count: number, order: Order) => count + 1;
    const data = getMonthlyData(orders, orderCountReducer).map(item => ({ month: item.month, orders: item.value }));
    return data;
}

export async function getServiceDistribution(orders: Order[]) {
  const now = new Date();
  const last30Days = subDays(now, 30);
  const recentOrders = orders.filter(o => o.createdAt >= last30Days);
  
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
  if (!auth.currentUser) return [];
  const q = query(priceTableCollection, where("userId", "==", auth.currentUser.uid));
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
