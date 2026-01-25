

export type OrderStatus = 'Novo' | 'Em Processo' | 'Aguardando Retirada' | 'Concluído';
export type ServiceType = 'Ajuste' | 'Design Personalizado' | 'Reparo' | 'Lavagem a Seco';
export type UserStatus = 'active' | 'inactive';
export type TokenDuration = number;


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

export interface UsedMaterial {
    materialId: string;
    materialName: string;
    quantityUsed: number;
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
  materialsUsed?: UsedMaterial[];
}

export interface PriceTableItem {
    id: string;
    serviceName: string;
    description?: string;
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
  trialStarted?: boolean;
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

export interface Suggestion {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
}

export interface Material {
    id: string;
    name: string;
    unit: string;
    stock: number;
    costPerUnit: number;
    createdAt: Date;
    userId: string;
    usedInOrders?: number;
}

export interface Purchase {
    id: string;
    materialName: string;
    quantity: number;
    cost: number;
    unit: string;
    category: string;
    createdAt: Date;
    userId: string;
}

export interface FixedCost {
    id: string;
    description: string;
    cost: number;
    date: Date;
    userId: string;
}

export interface UserSummary {
  id: string;
  userId: string;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: { [key: string]: number }; // YYYY-MM format
  monthlyCosts: { [key: string]: number }; // YYYY-MM format
}
