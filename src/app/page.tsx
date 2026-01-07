

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


export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary, loading: summaryLoading } = useDocument<UserSummary>(user ? `summaries/${user.uid}` : null);
  const { data: recentOrders, loading: ordersLoading } = useCollection<Order>('orders', {
    limit: 5,
    orderBy: ['createdAt', 'desc']
  });

  const { isPrivacyMode } = useContext(PasswordContext);
  const [serviceDistributionData, setServiceDistributionData] = useState<{ service: string; count: number; fill: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [profitData, setProfitData] = useState<{ month: string; revenue: number; cost: number; profit: number }[]>([]);

  // Trigger migration for existing users
  useEffect(() => {
    if (user && !summary && !summaryLoading) {
      getOrCreateUserSummary(user.uid); 
      // This will trigger a recalculation and the useDocument hook will pick up the new data
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

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-8">
            <Skeleton className="h-[415px] w-full" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      );
    }

    if (isPrivacyMode) {
      return (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-8">
            <Skeleton className="h-[415px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <OrderTableShell data={recentOrders || []} />
            </div>
            <div>
              <ServiceDistributionChart data={serviceDistributionData} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <main className="flex flex-1 flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCards 
            totalOrders={summary?.totalOrders || 0}
            totalRevenue={summary?.totalRevenue || 0}
            pendingCount={summary?.pendingOrders || 0}
          />
        </div>

         <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Faturamento</TabsTrigger>
            <TabsTrigger value="profit">Lucro</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
             <div className="grid grid-cols-1 gap-8">
                <RevenueChart data={revenueData} />
            </div>
          </TabsContent>
          <TabsContent value="profit" className="space-y-4">
             <div className="grid grid-cols-1 gap-8">
                <ProfitChart data={profitData} />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <OrderTableShell data={recentOrders || []} />
          </div>
          <div>
            <ServiceDistributionChart data={serviceDistributionData} />
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h2>
      </div>
      
      {renderDashboardContent()}
    </div>
  );
}
