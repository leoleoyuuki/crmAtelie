
'use client';

import { useCollection } from '@/firebase';
import { Material } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialTableShell } from '@/components/estoque/material-table-shell';
import { getMonthlyCostOfGoodsSold, getInventoryValue, getMonths } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';


export default function EstoquePage() {
  const { data: materials, loading: loadingMaterials } = useCollection<Material>('materials');

  const { inventoryValue } = useMemo(() => {
    if (!materials) return { inventoryValue: 0 };
    return { inventoryValue: getInventoryValue(materials) };
  }, [materials]);


  const formattedInventoryValue = useMemo(() => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(inventoryValue), [inventoryValue]);


  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Controle de Estoque
        </h2>
      </div>

       <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>Valor do Inventário</CardTitle>
                    <CardDescription>
                        Custo total dos materiais atualmente em estoque.
                    </CardDescription>
                </div>
                 <div className="text-right">
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    {loadingMaterials ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-2xl font-bold">{formattedInventoryValue}</p>}
                </div>
            </div>
        </CardHeader>
      </Card>


       {loadingMaterials ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <MaterialTableShell 
          data={materials || []}
        />
      )}
    </div>
  );
}
