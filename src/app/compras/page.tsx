
'use client';

import { useDocument, usePaginatedCollection } from '@/firebase';
import { Purchase, UserSummary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseTableShell } from '@/components/compras/purchase-table-shell';
import { useState, useMemo } from 'react';
import { getCostChartDataFromSummary } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '@/firebase/auth/use-user';
import { getOrCreateUserSummary } from '@/lib/data';
import { useEffect } from 'react';

export default function ComprasPage() {
  const { user } = useUser();
  const { data: purchases, loading, nextPage, prevPage, hasMore, hasPrev, refresh } = usePaginatedCollection<Purchase>('purchases');
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const [costData, setCostData] = useState<{ month: string; cost: number }[]>([]);

  // Trigger summary creation for existing users
  useEffect(() => {
    if (user && !summary && !summaryLoading) {
      getOrCreateUserSummary(user.uid);
    }
  }, [user, summary, summaryLoading]);

  useEffect(() => {
    if (summary) {
        setCostData(getCostChartDataFromSummary(summary));
    }
  }, [summary]);
  
  const totalCostThisMonth = useMemo(() => {
    if (!costData || costData.length === 0) return 0;
    // Assuming the last item in costData is the current month
    return costData[costData.length - 1].cost;
  }, [costData]);
  
  const formattedTotalCost = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalCostThisMonth);

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Controle de Compras e Custos
        </h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Visão Geral de Custos Mensais</CardTitle>
                <CardDescription>
                  Analise o custo total de aquisição de materiais nos últimos meses.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 sm:pt-0">
                <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground">Custo no Mês Atual</p>
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
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value as number)
                  }
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend />
                <Bar dataKey="cost" fill="hsl(var(--chart-1))" name="Custo Mensal" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum custo registrado para o período.
            </div>
          )}
        </CardContent>
      </Card>

       {loading && !purchases?.length ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <PurchaseTableShell 
          data={purchases || []}
          loading={loading}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          hasNextPage={hasMore}
          hasPrevPage={hasPrev}
          onDataMutated={refresh}
        />
      )}
    </div>
  );
}
