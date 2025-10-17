import { Order, OrderStatus, ServiceType } from '@/lib/types';
import { subMonths, format, startOfMonth, subDays, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const now = new Date();

let mockOrders: Order[] = [
  { id: 'ORD001', customerName: 'Eleanor Vance', customerPhone: '11987654321', serviceType: 'Ajuste', description: 'Fazer a barra da calça e ajustar a cintura', totalValue: 45.00, dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), status: 'Em Processo', createdAt: subDays(now, 2) },
  { id: 'ORD002', customerName: 'Marcos Oliveira', customerPhone: '21998765432', serviceType: 'Design Personalizado', description: 'Desenhar e criar um vestido de noite formal', totalValue: 650.00, dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), status: 'Novo', createdAt: subDays(now, 1) },
  { id: 'ORD003', customerName: 'Isabella Rossi', customerPhone: '31988887777', serviceType: 'Reparo', description: 'Consertar costura rasgada em uma blusa de seda', totalValue: 30.00, dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), status: 'Aguardando Retirada', createdAt: subMonths(now, 1) },
  { id: 'ORD004', customerName: 'Jameson Locke', customerPhone: '41977776666', serviceType: 'Lavagem a Seco', description: 'Terno completo, lavagem a seco e prensagem', totalValue: 25.00, dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'Em Processo', createdAt: subMonths(now, 1) },
  { id: 'ORD005', customerName: 'Clara Oswald', customerPhone: '51966665555', serviceType: 'Ajuste', description: 'Encurtar mangas de um casaco de inverno', totalValue: 70.00, dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), status: 'Concluído', createdAt: subMonths(now, 2) },
  { id: 'ORD006', customerName: 'Arthur Morgan', customerPhone: '61955554444', serviceType: 'Reparo', description: 'Remendar jaqueta jeans', totalValue: 35.00, dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), status: 'Concluído', createdAt: subMonths(now, 2) },
  { id: 'ORD007', customerName: 'Sadie Adler', customerPhone: '71944443333', serviceType: 'Design Personalizado', description: 'Colete de couro sob medida', totalValue: 320.00, dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), status: 'Em Processo', createdAt: subMonths(now, 3) },
  { id: 'ORD008', customerName: 'John Marston', customerPhone: '81933332222', serviceType: 'Ajuste', description: 'Apertar uma camisa vintage', totalValue: 40.00, dueDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), status: 'Concluído', createdAt: subMonths(now, 4) },
  { id: 'ORD009', customerName: 'Geralt de Rivia', customerPhone: '91922221111', serviceType: 'Reparo', description: 'Reforçar costuras de armadura de couro', totalValue: 150.00, dueDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), status: 'Concluído', createdAt: subMonths(now, 5) },
  { id: 'ORD010', customerName: 'Yennefer de Vengerberg', customerPhone: '11911110000', serviceType: 'Design Personalizado', description: 'Vestido de baile encantado, preto e branco', totalValue: 1200.00, dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), status: 'Concluído', createdAt: subMonths(now, 6) },
];

const api_delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getOrders(): Promise<Order[]> {
  await api_delay(100);
  return mockOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getStatusMetrics() {
  await api_delay(50);
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders
    .filter(o => o.status === 'Concluído')
    .reduce((sum, o) => sum + o.totalValue, 0);
  const pendingCount = mockOrders.filter(o => o.status === 'Novo' || o.status === 'Em Processo').length;
  
  return { totalOrders, totalRevenue, pendingCount };
}

const getMonthlyData = (reducer: (acc: number, order: Order) => number) => {
    const data: { month: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const value = mockOrders
            .filter(o => o.createdAt >= monthStart && o.createdAt <= monthEnd)
            .reduce(reducer, 0);

        data.push({
            month: format(monthDate, 'MMM', { locale: ptBR }),
            value: Math.round(value),
        });
    }
    return data;
}


export async function getRevenueLast6Months() {
  await api_delay(200);
  const revenueReducer = (sum: number, order: Order) => {
    if (order.status === 'Concluído') {
      return sum + order.totalValue;
    }
    return sum;
  };
  const data = getMonthlyData(revenueReducer).map(item => ({ month: item.month, revenue: item.value }));
  return data;
}

export async function getOrdersLast6Months() {
    await api_delay(200);
    const orderCountReducer = (count: number, order: Order) => count + 1;
    const data = getMonthlyData(orderCountReducer).map(item => ({ month: item.month, orders: item.value }));
    return data;
}

export async function getServiceDistribution() {
  await api_delay(150);
  const last30Days = subDays(now, 30);
  const recentOrders = mockOrders.filter(o => o.createdAt >= last30Days);
  
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
  throw new Error('Pedido não encontrado');
}

export async function deleteOrder(orderId: string) {
  await api_delay(100);
  const initialLength = mockOrders.length;
  mockOrders = mockOrders.filter(o => o.id !== orderId);
  if (mockOrders.length === initialLength) {
    throw new Error('Pedido não encontrado');
  }
  return { success: true };
}
