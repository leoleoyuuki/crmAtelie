export type OrderStatus = 'Novo' | 'Em Processo' | 'Aguardando Retirada' | 'Concluído';
export type ServiceType = 'Ajuste' | 'Design Personalizado' | 'Reparo' | 'Lavagem a Seco';
export type UserStatus = 'active' | 'inactive';
export type TokenDuration = 3 | 6 | 12;


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

export interface PriceTableItem {
    id: string;
    serviceName: string;
    price: number;
    userId: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status: UserStatus;
  expiresAt?: Date;
}

export interface AccessToken {
    id: string;
    code: string;
    duration: TokenDuration; // in months
    isUsed: boolean;
    usedBy?: string; // UID of user who used it
    usedAt?: Date;
    createdAt: Date;
}
