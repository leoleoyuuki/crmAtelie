'use client';

import { PriceTableShell } from '@/components/tabela-precos/price-table-shell';
import { PriceTableItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase';
import { Tags, Info } from 'lucide-react';

export default function PriceTablePage() {
  const { data: items, loading, error } = useCollection<PriceTableItem>('priceTable');

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Tabela de Preços
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Lista de Serviços
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Categorias
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Histórico de Reajustes
            </button>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-xl mt-0.5">
            <Tags className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Padronização do Ateliê</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Mantenha seus preços atualizados para garantir orçamentos rápidos e precisos durante o atendimento no balcão.
            </p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      ) : (
        <PriceTableShell 
          data={items || []}
          onItemCreated={() => {}}
          onItemUpdated={() => {}}
          onItemDeleted={() => {}}
        />
      )}
    </div>
  );
}
