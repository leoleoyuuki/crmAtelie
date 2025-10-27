
'use client';

import { useEffect, useState } from 'react';
import { PriceTableShell } from '@/components/tabela-precos/price-table-shell';
import { PriceTableItem } from '@/lib/types';
import { getPriceTableItems } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function PriceTablePage() {
  const [items, setItems] = useState<PriceTableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const fetchedItems = await getPriceTableItems();
      setItems(fetchedItems);
      setLoading(false);
    };
    fetchItems();
  }, []);
  
  const handleItemCreated = (newItem: PriceTableItem) => {
    setItems(current => [newItem, ...current]);
  };

  const handleItemUpdated = (itemId: string, updatedItem: Partial<PriceTableItem>) => {
    setItems(current =>
      current.map(item => (item.id === itemId ? { ...item, ...updatedItem } : item))
    );
  };
  
  const handleItemDeleted = (itemId: string) => {
    setItems(current => current.filter(item => item.id !== itemId));
  };


  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Tabela de Preços
        </h2>
      </div>
      {loading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <PriceTableShell 
          data={items}
          onItemCreated={handleItemCreated}
          onItemUpdated={handleItemUpdated}
          onItemDeleted={handleItemDeleted}
        />
      )}
    </div>
  );
}
