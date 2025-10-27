export type OrderStatus = 'Novo' | 'Em Processo' | 'Aguardando Retirada' | 'Concluído';
export type ServiceType = 'Ajuste' | 'Design Personalizado' | 'Reparo' | 'Lavagem a Seco';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  userId: string;
}

export interface OrderItem {
  serviceType: ServiceType;
  description?: string;
  value: number;
  assignedTo?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for easy display
  items: OrderItem[];
  totalValue: number;
  dueDate: Date;
  status: OrderStatus;
  createdAt: Date;
  userId: string;
}
