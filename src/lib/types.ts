export type OrderStatus = 'Novo' | 'Em Processo' | 'Aguardando Retirada' | 'Concluído';
export type ServiceType = 'Ajuste' | 'Design Personalizado' | 'Reparo' | 'Lavagem a Seco';

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
