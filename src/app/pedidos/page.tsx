
'use client';

import { useCollection } from '@/firebase';
import { Order } from '@/lib/types';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const { data: orders, loading } = useCollection<Order>('orders');
  
  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Pedidos
          </h2>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Pedidos
        </h2>
      </div>
      <OrderTableShell data={orders || []} isPage />
    </div>
  );
}
