export type OrderStatus = 'Pending' | 'In Process' | 'Completed' | 'Awaiting Pickup' | 'Delivered';
export type ServiceType = 'Alteration' | 'Custom Design' | 'Repair' | 'Dry Cleaning';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  description: string;
  totalValue: number;
  dueDate: Date;
  status: OrderStatus;
  createdAt: Date;
}
