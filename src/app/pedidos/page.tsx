'use client';

import { usePaginatedCollection } from '@/firebase';
import { Order } from '@/lib/types';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function OrdersPage() {
  const { data: orders, loading, nextPage, prevPage, hasMore, hasPrev, refresh } = usePaginatedCollection<Order>('orders');
  
  const handleDataMutation = () => {
    refresh();
  }

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
       <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Gestão de Pedidos
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Fluxo de Trabalho
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Histórico de Vendas
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Relatórios
            </button>
        </div>
      </div>

      {/* Banner Informativo Estilo Patreon */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-xl mt-0.5">
            <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Dica de Produtividade</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Você pode filtrar seus pedidos por status ou tipo de serviço abaixo. Use os filtros rápidos para focar no que é urgente hoje.
            </p>
        </div>
      </div>

      {loading && !orders?.length ? (
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      ) : (
        <OrderTableShell 
            data={orders || []} 
            isPage 
            onNextPage={nextPage}
            onPrevPage={prevPage}
            hasNextPage={hasMore}
            hasPrevPage={hasPrev}
            loading={loading}
            onDataMutated={handleDataMutation}
        />
      )}
    </div>
  );
}
