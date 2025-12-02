

'use client';

import { PriceTableShell } from '@/components/tabela-precos/price-table-shell';
import { PriceTableItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase';

export default function PriceTablePage() {
  const { data: items, loading, error } = useCollection<PriceTableItem>('priceTable');

  const handleItemCreated = (newItem: PriceTableItem) => {
    // Optimistic update handled by useCollection is tricky,
    // so we'll just let the listener handle it for now.
  };

  const handleItemUpdated = (itemId: string, updatedItem: Partial<PriceTableItem>) => {
    // Optimistic update handled by useCollection is tricky,
    // so we'll just let the listener handle it for now.
  };
  
  const handleItemDeleted = (itemId: string) => {
    // Optimistic update handled by useCollection is tricky,
    // so we'll just let the listener handle it for now.
  };

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Tabela de Preços
        </h2>
      </div>
      {loading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <PriceTableShell 
          data={items || []}
          onItemCreated={handleItemCreated}
          onItemUpdated={handleItemUpdated}
          onItemDeleted={handleItemDeleted}
        />
      )}
    </div>
  );
}
