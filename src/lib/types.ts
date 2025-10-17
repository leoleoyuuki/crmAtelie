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

export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for easy display
  serviceType: ServiceType;
  description?: string;
  totalValue: number;
  dueDate: Date;
  status: OrderStatus;
  createdAt: Date;
  userId: string;
}
