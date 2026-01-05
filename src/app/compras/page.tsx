

'use client';

import { usePaginatedCollection, useDocument } from '@/firebase';
import { Purchase, UserSummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseTableShell } from '@/components/compras/purchase-table-shell';
import { useState, useMemo, useEffect } from 'react';
import { getCostChartDataFromSummary } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '@/firebase/auth/use-user';


export default function ComprasPage() {
  const { user } = useUser();
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const { data: purchases, loading, nextPage, prevPage, hasMore, hasPrev, refresh } = usePaginatedCollection<Purchase>('purchases');
  
  const costData = useMemo(() => {
    if (!summary) return [];
    return getCostChartDataFromSummary(summary);
  }, [summary]);

  const totalCostThisMonth = useMemo(() => {
    if (!costData || costData.length === 0) return 0;
    const currentMonthLabel = new Date().toLocaleString('default', { month: 'short' });
    const currentMonthData = costData.find(d => d.month.toLowerCase().startsWith(currentMonthLabel.toLowerCase()));
    return currentMonthData ? currentMonthData.cost : 0;
  }, [costData]);

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
                  Analise o total de custos com aquisição de materiais por mês.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 sm:pt-0">
                <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground">Custo do Mês Atual</p>
                    <div className="text-2xl font-bold">{summaryLoading ? <Skeleton className="h-8 w-24" /> : formattedTotalCost}</div>
                </div>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : costData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
              Nenhum dado de custo para exibir.
            </div>
          )}
        </CardContent>
      </Card>

       {loading && !purchases.length ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <PurchaseTableShell 
          data={purchases || []}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          hasNextPage={hasMore}
          hasPrevPage={hasPrev}
          loading={loading}
        />
      )}
    </div>
  );
}
