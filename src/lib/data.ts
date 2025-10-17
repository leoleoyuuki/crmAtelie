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
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Order, OrderStatus, ServiceType } from '@/lib/types';
import { subMonths, format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ordersCollection = collection(db, 'orders');

// Helper para converter Timestamps do Firebase em Date
const fromFirebase = (order: any): Order => {
    return {
        ...order,
        id: order.id,
        dueDate: (order.dueDate as Timestamp).toDate(),
        createdAt: (order.createdAt as Timestamp).toDate(),
    };
};

export async function getOrders(): Promise<Order[]> {
  const snapshot = await getDocs(ordersCollection);
  return snapshot.docs.map(doc => fromFirebase({ ...doc.data(), id: doc.id }));
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
    acc[order.serviceType] = (acc[order.serviceType] || 0) + 1;
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

export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
  const newOrderData = {
      ...order,
      createdAt: Timestamp.now(),
      dueDate: Timestamp.fromDate(order.dueDate),
  };
  const docRef = await addDoc(ordersCollection, newOrderData);
  return { ...newOrderData, id: docRef.id };
}

export async function updateOrder(orderId: string, updatedData: Partial<Omit<Order, 'id' | 'createdAt'>>) {
  const docRef = doc(db, 'orders', orderId);
  const updatePayload: any = { ...updatedData };

  if (updatedData.dueDate && !(updatedData.dueDate instanceof Timestamp)) {
    updatePayload.dueDate = Timestamp.fromDate(updatedData.dueDate);
  }

  await updateDoc(docRef, updatePayload);
  
  const updatedDoc = await getDoc(docRef);
  return fromFirebase({ ...updatedDoc.data(), id: updatedDoc.id });
}

export async function deleteOrder(orderId: string) {
  const docRef = doc(db, 'orders', orderId);
  await deleteDoc(docRef);
  return { success: true };
}
