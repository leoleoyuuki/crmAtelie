
'use client';

import { useEffect, useState, useContext, useMemo } from 'react';
import { useCollection, useDocument } from '@/firebase';
import { Order, UserSummary } from '@/lib/types';
import { getServiceDistributionData, getRevenueChartDataFromSummary, getProfitChartDataFromSummary, getMonths } from '@/lib/data';
import { StatsStack } from '@/components/dashboard/stats-stack';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ServiceDistributionChart } from '@/components/dashboard/service-distribution-chart';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordContext } from '@/contexts/password-context';
import { getOrCreateUserSummary } from '@/lib/data';
import { useUser } from '@/firebase/auth/use-user';
import { ProfitChart } from '@/components/dashboard/profit-chart';
import { WelcomeGuide } from '@/components/dashboard/welcome-guide';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus, Sparkles, ArrowRight, Clock, AlertCircle, Filter } from 'lucide-react';
import { OrderFormDialog } from '@/components/dashboard/order-form-dialog';
import { CustomerFormDialog } from '@/components/dashboard/customer-form-dialog';
import { WhatsNew } from '@/components/dashboard/whats-new';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const { data: recentOrders, loading: ordersLoading, refresh } = useCollection<Order>('orders', {
    limit: 5,
    orderBy: ['createdAt', 'desc']
  });

  const { isPrivacyMode } = useContext(PasswordContext);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  
  const [serviceDistributionData, setServiceDistributionData] = useState<{ service: string; count: number; fill: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [profitData, setProfitData] = useState<{ month: string; revenue: number; cost: number; profit: number }[]>([]);
  
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);

  const monthsOptions = useMemo(() => getMonths(), []);

  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    setSelectedPeriod(currentMonth);
  }, []);

  const stats = useMemo(() => {
    if (!summary) return { totalRevenue: 0, totalProfit: 0, totalOrders: 0, pendingOrders: 0 };

    if (selectedPeriod === 'all') {
        const totalCosts = Object.values(summary.monthlyCosts || {}).reduce((acc, cost) => acc + cost, 0);
        const totalProfit = summary.totalRevenue - totalCosts;
        return { 
            totalRevenue: summary.totalRevenue, 
            totalProfit, 
            totalOrders: summary.totalOrders, 
            pendingOrders: summary.pendingOrders 
        };
    }

    const rev = summary.monthlyRevenue?.[selectedPeriod] || 0;
    const cost = summary.monthlyCosts?.[selectedPeriod] || 0;
    const ord = summary.monthlyOrders?.[selectedPeriod] || 0;
    const pend = summary.monthlyPending?.[selectedPeriod] || 0;
    
    return {
        totalRevenue: rev,
        totalProfit: rev - cost,
        totalOrders: ord,
        pendingOrders: pend
    };
  }, [summary, selectedPeriod]);

  useEffect(() => {
    if (user && !summary && !summaryLoading) {
      getOrCreateUserSummary(user.uid); 
    }
  }, [user, summary, summaryLoading]);
  
  useEffect(() => {
    if (summary) {
        setServiceDistributionData(getServiceDistributionData(summary.serviceDistribution));
        setRevenueData(getRevenueChartDataFromSummary(summary));
        setProfitData(getProfitChartDataFromSummary(summary));
    }
  }, [summary]);

  const loading = summaryLoading || ordersLoading;
  
  const handleDataMutation = () => {
    refresh();
  }

  const renderDashboardContent = () => {
    if (loading && !recentOrders?.length) {
      return (
        <div className="space-y-8">
          <Skeleton className="h-[100px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             <div className="md:col-span-3 space-y-4">
                <Skeleton className="h-[80px] w-full" />
                <Skeleton className="h-[80px] w-full" />
                <Skeleton className="h-[80px] w-full" />
             </div>
             <div className="md:col-span-6">
                <Skeleton className="h-[300px] w-full" />
             </div>
             <div className="md:col-span-3">
                <Skeleton className="h-[300px] w-full" />
             </div>
          </div>
        </div>
      );
    }

    return (
       <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-primary uppercase tracking-widest md:hidden">Página Inicial</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight font-headline text-foreground leading-tight">
                        Olá, {user?.displayName?.split(' ')[0]}.
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base font-medium capitalize">
                        {format(new Date(), "eeee, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl border-dashed bg-primary/5 text-primary font-bold text-xs">
                        <Filter className="h-3 w-3 mr-2" />
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Vitalício (Máximo)</SelectItem>
                        {monthsOptions.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                <div className="hidden md:flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
                        onClick={() => setIsCustomerFormOpen(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo Cliente
                    </Button>
                    <Button 
                        className="rounded-xl font-bold shadow-lg shadow-primary/20"
                        onClick={() => setIsOrderFormOpen(true)}
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Novo Pedido
                    </Button>
                </div>
            </div>
          </div>

          <WelcomeGuide />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-3">
                <StatsStack 
                    totalRevenue={stats.totalRevenue}
                    totalProfit={stats.totalProfit}
                    totalOrders={stats.totalOrders}
                    pendingOrders={stats.pendingOrders}
                    isPrivacyMode={isPrivacyMode}
                    periodLabel={selectedPeriod === 'all' ? 'Total Acumulado' : monthsOptions.find(m => m.value === selectedPeriod)?.label || 'Mensal'}
                />
            </div>

            <div className="lg:col-span-6">
                <ServiceDistributionChart data={serviceDistributionData} />
            </div>

            <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-card rounded-2xl border p-4 shadow-sm flex flex-col flex-1 h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Atividade</h3>
                        <Badge variant="outline" className="text-[9px] px-1.5 h-4">Geral</Badge>
                    </div>
                    
                    <div className="space-y-4 flex-grow flex flex-col justify-between">
                        <Link href="/tarefas" className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-primary/20 p-1.5 rounded-lg">
                                    <AlertCircle className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-bold">Tarefas Críticas</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-black text-primary">{summary?.pendingOrders || 0}</span>
                                <ArrowRight className="h-2.5 w-3 text-primary transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border bg-muted/20">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Concluídos</p>
                                <p className="text-lg font-black leading-tight">{summary?.totalOrders ? summary.totalOrders - (summary.pendingOrders || 0) : 0}</p>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Em Aberto</p>
                                <p className="text-lg font-black text-primary leading-tight">{summary?.pendingOrders || 0}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-medium text-muted-foreground">Eficiência de Entrega</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000" 
                                    style={{ width: `${Math.min(((summary?.totalOrders || 1) - (summary?.pendingOrders || 0)) / (summary?.totalOrders || 1) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <WhatsNew />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
             <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/5 flex items-center justify-between">
                    <h3 className="font-headline font-bold text-xl">Desempenho Financeiro</h3>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Faturamento & Lucro</Badge>
                    </div>
                </div>
                <div className="p-6">
                    <ProfitChart data={profitData} isPrivacyMode={isPrivacyMode} />
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-2xl">Pedidos Recentes</h3>
                <Button asChild variant="link" className="text-primary font-bold">
                    <Link href="/pedidos">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            <OrderTableShell data={recentOrders || []} onDataMutated={handleDataMutation} isPrivacyMode={isPrivacyMode} />
          </div>

          <OrderFormDialog 
                isOpen={isOrderFormOpen} 
                setIsOpen={setIsOrderFormOpen} 
                onOrderCreated={handleDataMutation}
            />
            <CustomerFormDialog 
                isOpen={isCustomerFormOpen} 
                setIsOpen={setIsCustomerFormOpen} 
                onCustomerCreated={handleDataMutation}
                onCustomerUpdated={handleDataMutation}
            />
       </div>
    );
  };

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8 pb-10 max-w-[1600px] mx-auto">
      {renderDashboardContent()}
    </div>
  );
}
