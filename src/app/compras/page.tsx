

'use client';

import { useCollection } from '@/firebase';
import { Purchase } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseTableShell } from '@/components/compras/purchase-table-shell';
import { useState, useMemo } from 'react';
import { getMonths, getMonthlyCostByCategory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComprasPage() {
  const { data: purchases, loading } = useCollection<Purchase>('purchases');
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getMonth()}-${new Date().getFullYear()}`);
  
  const months = useMemo(() => getMonths(), []);

  const { monthlyCostData, totalMonthlyCost } = useMemo(() => {
    if (!purchases) return { monthlyCostData: [], totalMonthlyCost: 0 };
    
    const [month, year] = selectedMonth.split('-').map(Number);
    const monthlyCostData = getMonthlyCostByCategory(purchases, month, year);

    const totalMonthlyCost = monthlyCostData.reduce((acc, item) => acc + item.cost, 0);

    return { monthlyCostData, totalMonthlyCost };
  }, [purchases, selectedMonth]);

  const formattedTotalMonthlyCost = useMemo(() => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalMonthlyCost), [totalMonthlyCost]);

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
                  Analise os custos de aquisição de materiais por categoria.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 sm:pt-0">
                <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground">Custo do Mês</p>
                    <p className="text-2xl font-bold">{formattedTotalMonthlyCost}</p>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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
              <BarChart data={monthlyCostData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: 'compact'
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
        <PurchaseTableShell 
          data={purchases || []}
        />
      )}
    </div>
  );
}
