import { Order, OrderStatus, ServiceType } from '@/lib/types';
import { subMonths, format, startOfMonth } from 'date-fns';

// Mock data using faker-js would be ideal, but for this self-contained example, we'll manually create it.
const now = new Date();

let mockOrders: Order[] = [
  { id: 'ORD001', customerName: 'Eleanor Vance', customerPhone: '12025550191', serviceType: 'Alteration', description: 'Hem trousers and adjust waist', totalValue: 45.00, dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), status: 'In Process', createdAt: subMonths(now, 0) },
  { id: 'ORD002', customerName: 'Marcus Holloway', customerPhone: '13125550188', serviceType: 'Custom Design', description: 'Design and create a formal evening gown', totalValue: 650.00, dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), status: 'Pending', createdAt: subMonths(now, 0) },
  { id: 'ORD003', customerName: 'Isabella Rossi', customerPhone: '12155550134', serviceType: 'Repair', description: 'Fix torn seam on a silk blouse', totalValue: 30.00, dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), status: 'Awaiting Pickup', createdAt: subMonths(now, 1) },
  { id: 'ORD004', customerName: 'Jameson Locke', customerPhone: '14155550101', serviceType: 'Dry Cleaning', description: 'Full suit dry clean and press', totalValue: 25.00, dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'In Process', createdAt: subMonths(now, 1) },
  { id: 'ORD005', customerName: 'Clara Oswald', customerPhone: '16465550158', serviceType: 'Alteration', description: 'Shorten sleeves on a winter coat', totalValue: 70.00, dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), status: 'Delivered', createdAt: subMonths(now, 2) },
  { id: 'ORD006', customerName: 'Arthur Morgan', customerPhone: '15125550123', serviceType: 'Repair', description: 'Patch denim jacket', totalValue: 35.00, dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), status: 'Completed', createdAt: subMonths(now, 2) },
  { id: 'ORD007', customerName: 'Sadie Adler', customerPhone: '18175550145', serviceType: 'Custom Design', description: 'Bespoke leather vest', totalValue: 320.00, dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), status: 'In Process', createdAt: subMonths(now, 3) },
  { id: 'ORD008', customerName: 'John Marston', customerPhone: '19725550177', serviceType: 'Alteration', description: 'Take in a vintage shirt', totalValue: 40.00, dueDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), status: 'Delivered', createdAt: subMonths(now, 4) },
  { id: 'ORD009', customerName: 'Geralt of Rivia', customerPhone: '12145550166', serviceType: 'Repair', description: 'Reinforce leather armor seams', totalValue: 150.00, dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), status: 'Delivered', createdAt: subMonths(now, 5) },
  { id: 'ORD010', customerName: 'Yennefer of Vengerberg', customerPhone: '12135550199', serviceType: 'Custom Design', description: 'Enchanted ball gown, black and white', totalValue: 1200.00, dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), status: 'Delivered', createdAt: subMonths(now, 6) },
];

// Simulate API latency
const api_delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getOrders(): Promise<Order[]> {
  await api_delay(100);
  return mockOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getStatusMetrics() {
  await api_delay(50);
  const inProcessCount = mockOrders.filter(o => o.status === 'In Process').length;
  const awaitingPickupCount = mockOrders.filter(o => o.status === 'Awaiting Pickup').length;
  return { inProcessCount, awaitingPickupCount };
}

export async function getRevenueLast6Months() {
  await api_delay(200);
  const data: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(now, i);
    const revenue = mockOrders
      .filter(o => o.createdAt >= startOfMonth(month) && o.createdAt < startOfMonth(subMonths(now, i-1)))
      .filter(o => o.status === 'Completed' || o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalValue, 0);

    data.push({
      month: format(month, 'MMM'),
      revenue: Math.round(revenue),
    });
  }
  return data;
}

export async function getServiceDistribution() {
  await api_delay(150);
  const last30Days = subMonths(now, 1);
  const recentOrders = mockOrders.filter(o => o.createdAt >= last30Days);
  
  const distribution = recentOrders.reduce((acc, order) => {
    acc[order.serviceType] = (acc[order.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<ServiceType, number>);

  return Object.entries(distribution).map(([service, count], index) => ({
    service,
    count,
    fill: `var(--chart-${index + 1})`
  }));
}

// CRUD operations
export async function addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
  await api_delay(100);
  const newOrder: Order = {
    ...order,
    id: `ORD${String(mockOrders.length + 1).padStart(3, '0')}`,
    createdAt: new Date(),
  };
  mockOrders.push(newOrder);
  return newOrder;
}

export async function updateOrder(orderId: string, updatedData: Partial<Order>) {
  await api_delay(100);
  const index = mockOrders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    mockOrders[index] = { ...mockOrders[index], ...updatedData };
    return mockOrders[index];
  }
  throw new Error('Order not found');
}

export async function deleteOrder(orderId: string) {
  await api_delay(100);
  const initialLength = mockOrders.length;
  mockOrders = mockOrders.filter(o => o.id !== orderId);
  if (mockOrders.length === initialLength) {
    throw new Error('Order not found');
  }
  return { success: true };
}
