'use client';

import { useDocument, usePaginatedCollection } from '@/firebase';
import { Purchase, UserSummary, FixedCost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseTableShell } from '@/components/compras/purchase-table-shell';
import { useState, useMemo } from 'react';
import { getCostChartDataFromSummary } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '@/firebase/auth/use-user';
import { getOrCreateUserSummary } from '@/lib/data';
import { useEffect } from 'react';
import { FixedCostManager } from '@/components/compras/fixed-cost-manager';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Wallet, Info, Sparkles } from 'lucide-react';

// Helper to convert Firestore Timestamps in nested objects
const convertTimestamps = (data: any) => {
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            convertTimestamps(data[key]);
        }
    }
    return data;
}

export default function ComprasPage() {
  const { user } = useUser();
  const { db } = useFirebase();
  const { data: purchases, loading, nextPage, prevPage, hasMore, hasPrev, refresh } = usePaginatedCollection<Purchase>('purchases');
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const [costData, setCostData] = useState<{ month: string; cost: number }[]>([]);
  
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [fixedCostsLoading, setFixedCostsLoading] = useState(true);

  const fetchFixedCosts = async () => {
    if (!user) {
        setFixedCosts([]);
        setFixedCostsLoading(false);
        return;
    };

    setFixedCostsLoading(true);
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const q = query(
        collection(db, 'fixedCosts'),
        where('userId', '==', user.uid),
        where('date', '>=', startOfCurrentMonth),
        where('date', '<=', endOfCurrentMonth)
    );

    try {
        const querySnapshot = await getDocs(q);
        const costs = querySnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as FixedCost);
        setFixedCosts(costs);
    } catch (error) {
        console.error("Error fetching fixed costs:", error);
    } finally {
        setFixedCostsLoading(false);
    }
  }

  useEffect(() => {
    fetchFixedCosts();
  }, [user, db]);


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
    if (!summary || !summary.monthlyCosts) return 0;
    const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    return summary.monthlyCosts[currentMonthKey] || 0;
  }, [summary]);
  
  const formattedTotalCost = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalCostThisMonth);

  const handleDataMutation = () => {
    refresh();
    if(user) getOrCreateUserSummary(user.uid); 
    fetchFixedCosts();
  }

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Custos e Compras
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Registro de Saídas
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Custos Fixos
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Análise Anual
            </button>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-xl mt-0.5">
            <Wallet className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Saúde Financeira</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Registre cada compra de material aqui para que o sistema calcule seu <strong>Lucro Real</strong> automaticamente no dashboard.
            </p>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/10 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline text-xl">Fluxo de Despesas</CardTitle>
                        <CardDescription>
                        Materiais e custos operacionais nos últimos meses.
                        </CardDescription>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saídas este mês</p>
                        <div className="text-2xl font-black text-primary">{summaryLoading ? <Skeleton className="h-8 w-24" /> : formattedTotalCost}</div>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="p-6">
                {summaryLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : costData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} fontSize={12} fontWeight={600} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} fontSize={10} fontWeight={600} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) =>
                                new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                }).format(value as number)
                            }
                        />
                        <Bar dataKey="cost" fill="hsl(var(--primary))" name="Custo Mensal" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-2xl">
                    Nenhum custo registrado no período.
                    </div>
                )}
                </CardContent>
            </Card>
          </div>
           <div className="lg:col-span-4">
             <FixedCostManager 
                data={fixedCosts || []} 
                loading={fixedCostsLoading}
                onDataMutated={handleDataMutation}
             />
           </div>
      </div>
      
       {loading && !purchases?.length ? (
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      ) : (
        <PurchaseTableShell 
          data={purchases || []}
          loading={loading}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          hasNextPage={hasMore}
          hasPrevPage={hasPrev}
          onDataMutated={handleDataMutation}
        />
      )}
    </div>
  );
}
