
'use client';

import { useCollection } from '@/firebase';
import { Material } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialTableShell } from '@/components/estoque/material-table-shell';
import { useState, useMemo, useEffect } from 'react';
import { getMonths, getTotalStockCost, getMonthlyCostByCategory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EstoquePage() {
  const { data: materials, loading } = useCollection<Material>('materials');
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getMonth()}-${new Date().getFullYear()}`);
  
  const months = useMemo(() => getMonths(), []);

  const { totalStockCost, monthlyCostData } = useMemo(() => {
    if (!materials) return { totalStockCost: 0, monthlyCostData: [] };

    const totalStockCost = getTotalStockCost(materials);
    
    const [month, year] = selectedMonth.split('-').map(Number);
    const monthlyCostData = getMonthlyCostByCategory(materials, month, year);

    return { totalStockCost, monthlyCostData };
  }, [materials, selectedMonth]);

  const formattedTotalStockCost = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalStockCost);

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
                <CardTitle>Visão Geral do Estoque</CardTitle>
                <CardDescription>
                  Analise o custo total do seu estoque e os gastos mensais por categoria.
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Custo Total do Estoque</p>
                    <p className="text-2xl font-bold">{formattedTotalStockCost}</p>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione um mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : monthlyCostData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCostData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value as number)
                  }
                />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value as number)
                  }
                />
                <Legend />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Custo" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado de custo para o mês selecionado.
            </div>
          )}
        </CardContent>
      </Card>

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
