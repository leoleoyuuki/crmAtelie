
'use client';

import { useCollection } from '@/firebase';
import { Material } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialTableShell } from '@/components/estoque/material-table-shell';

export default function EstoquePage() {
  const { data: materials, loading } = useCollection<Material>('materials');

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Controle de Estoque
        </h2>
      </div>
       {loading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <MaterialTableShell 
          data={materials || []}
        />
      )}
    </div>
  );
}
