

'use client';

import { useEffect, useState, useContext, useMemo } from 'react';
import { useCollection } from '@/firebase';
import { Order } from '@/lib/types';
import { getOrdersLast6Months, getRevenueLast6Months, getServiceDistribution, getStatusMetrics } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ServiceDistributionChart } from '@/components/dashboard/service-distribution-chart';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { OrderVolumeChart } from '@/components/dashboard/order-volume-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { PasswordContext } from '@/contexts/password-context';

export default function DashboardPage() {
  const { data: orders, loading } = useCollection<Order>('orders');
  const { isPrivacyMode } = useContext(PasswordContext);

  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingCount: 0 });
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [serviceDistributionData, setServiceDistributionData] = useState<{ service: string; count: number; fill: string }[]>([]);
  const [orderVolumeData, setOrderVolumeData] = useState<{ month: string; orders: number }[]>([]);

  useEffect(() => {
    if (orders) {
        setStats(getStatusMetrics(orders));
        setRevenueData(getRevenueLast6Months(orders));
        setServiceDistributionData(getServiceDistribution(orders));
        setOrderVolumeData(getOrdersLast6Months(orders));
    }
  }, [orders]);

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="h-[415px] w-full" />
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="h-[415px] w-full" />
            <Skeleton className="h-[415px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <OrderTableShell data={orders || []} />
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
            totalOrders={stats.totalOrders}
            totalRevenue={stats.totalRevenue}
            pendingCount={stats.pendingCount}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <RevenueChart data={revenueData} />
          <OrderVolumeChart data={orderVolumeData} />
        </div>
        
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <OrderTableShell data={orders || []} />
          </div>
          <div>
            <ServiceDistributionChart data={serviceDistributionData} />
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h2>
      </div>
      
      {renderDashboardContent()}
    </div>
  );
}
