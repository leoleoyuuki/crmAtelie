
'use client';

import { useCollection } from '@/firebase';
import { Purchase } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseTableShell } from '@/components/compras/purchase-table-shell';
import { useState, useMemo } from 'react';
import { getMonths, getMonthlyCostByCategory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getYear, getMonth } from 'date-fns';

const months = getMonths();

export default function ComprasPage() {
  const { data: allPurchases, loading, error } = useCollection<Purchase>('purchases');
  const [selectedMonth, setSelectedMonth] = useState(`${getMonth(new Date())}-${getYear(new Date())}`);

  const chartData = useMemo(() => {
    if (!allPurchases) return [];
    const [month, year] = selectedMonth.split('-').map(Number);
    return getMonthlyCostByCategory(allPurchases, month, year);
  }, [allPurchases, selectedMonth]);

  const totalCostThisMonth = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.cost, 0);
  }, [chartData]);
  
  const formattedTotalCost = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalCostThisMonth);

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Controle de Compras
        </h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Visão Geral de Custos</CardTitle>
                <CardDescription>
                  Analise o custo de aquisição de materiais por categoria no mês selecionado.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 sm:pt-0">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-10 w-full sm:w-[200px]">
                        <SelectValue placeholder="Selecione um mês" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(month => (
                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground">Custo Total do Mês</p>
                    <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : formattedTotalCost}</div>
                </div>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `R$${value}`} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
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
              Nenhum custo registrado para o mês selecionado.
            </div>
          )}
        </CardContent>
      </Card>

       {loading && !allPurchases?.length ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <PurchaseTableShell 
          data={allPurchases || []}
        />
      )}
    </div>
  );
}
