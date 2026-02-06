
'use client';

import { useEffect, useState, useContext, useMemo } from 'react';
import { useCollection, useDocument } from '@/firebase';
import { Order, UserSummary } from '@/lib/types';
import { getServiceDistribution, getRevenueChartDataFromSummary, getProfitChartDataFromSummary } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ServiceDistributionChart } from '@/components/dashboard/service-distribution-chart';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordContext } from '@/contexts/password-context';
import { getOrCreateUserSummary } from '@/lib/data';
import { useUser } from '@/firebase/auth/use-user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfitChart } from '@/components/dashboard/profit-chart';
import { ProfitStatsCards } from '@/components/dashboard/profit-stats-cards';
import { WelcomeGuide } from '@/components/dashboard/welcome-guide';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus, Phone } from 'lucide-react';
import { OrderFormDialog } from '@/components/dashboard/order-form-dialog';
import { CustomerFormDialog } from '@/components/dashboard/customer-form-dialog';


export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const { data: recentOrders, loading: ordersLoading, refresh } = useCollection<Order>('orders', {
    limit: 5,
    orderBy: ['createdAt', 'desc']
  });

  const { isPrivacyMode } = useContext(PasswordContext);
  const [serviceDistributionData, setServiceDistributionData] = useState<{ service: string; count: number; fill: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [profitData, setProfitData] = useState<{ month: string; revenue: number; cost: number; profit: number }[]>([]);
  
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);

  const { totalCosts, totalProfit } = useMemo(() => {
    if (!summary) return { totalCosts: 0, totalProfit: 0 };
    const costs = Object.values(summary.monthlyCosts || {}).reduce((acc, cost) => acc + cost, 0);
    const profit = summary.totalRevenue - costs;
    return { totalCosts: costs, totalProfit: profit };
  }, [summary]);

  useEffect(() => {
    if (user && !summary && !summaryLoading) {
      getOrCreateUserSummary(user.uid); 
    }
  }, [user, summary, summaryLoading]);
  
  useEffect(() => {
    if (recentOrders) {
        setServiceDistributionData(getServiceDistribution(recentOrders));
    }
    if (summary) {
        setRevenueData(getRevenueChartDataFromSummary(summary));
        setProfitData(getProfitChartDataFromSummary(summary));
    }
  }, [recentOrders, summary]);

  const loading = summaryLoading || ordersLoading;
  
  const handleDataMutation = () => {
    refresh();
  }

  const renderDashboardContent = () => {
    if (loading && !recentOrders?.length) {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
             <Skeleton className="h-[60px] w-full" />
             <Skeleton className="h-[60px] w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
          </div>
          <Skeleton className="h-[415px] w-full" />
        </div>
      );
    }

    return (
       <div className="space-y-6">
          {/* Quick Actions for Mobile Retainability */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
             <Button 
                variant="default" 
                className="h-16 flex flex-col gap-1 rounded-2xl shadow-md"
                onClick={() => setIsOrderFormOpen(true)}
             >
                <PlusCircle className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase">Novo Pedido</span>
             </Button>
             <Button 
                variant="secondary" 
                className="h-16 flex flex-col gap-1 rounded-2xl shadow-md"
                onClick={() => setIsCustomerFormOpen(true)}
             >
                <UserPlus className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase">Novo Cliente</span>
             </Button>
          </div>

          <WelcomeGuide />

          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="revenue" className="rounded-md">Faturamento</TabsTrigger>
                <TabsTrigger value="profit" className="rounded-md">Lucro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCards 
                    totalOrders={summary?.totalOrders || 0}
                    totalRevenue={summary?.totalRevenue || 0}
                    pendingCount={summary?.pendingOrders || 0}
                    isPrivacyMode={isPrivacyMode}
                />
                </div>
                <div className="grid grid-cols-1 gap-8">
                    <RevenueChart data={revenueData} isPrivacyMode={isPrivacyMode} />
                </div>
            </TabsContent>

            <TabsContent value="profit" className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <ProfitStatsCards
                        totalProfit={totalProfit}
                        totalRevenue={summary?.totalRevenue || 0}
                        totalCosts={totalCosts}
                        isPrivacyMode={isPrivacyMode}
                    />
                </div>
                <div className="grid grid-cols-1 gap-8">
                    <ProfitChart data={profitData} isPrivacyMode={isPrivacyMode} />
                </div>
            </TabsContent>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <OrderTableShell data={recentOrders || []} onDataMutated={handleDataMutation} isPrivacyMode={isPrivacyMode} />
                </div>
                <div>
                    <ServiceDistributionChart data={serviceDistributionData} />
                </div>
                </div>
            </Tabs>

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
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8 pb-10">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Olá, {user?.displayName?.split(' ')[0]}
        </h2>
      </div>
      
      {renderDashboardContent()}
    </div>
  );
}
