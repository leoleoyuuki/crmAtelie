import { getOrders, getRevenueLast6Months, getServiceDistribution, getStatusMetrics, getOrdersLast6Months } from '@/lib/data';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ServiceDistributionChart } from '@/components/dashboard/service-distribution-chart';
import OrderTableShell from '@/components/dashboard/order-table-shell';
import { OrderVolumeChart } from '@/components/dashboard/order-volume-chart';

export default async function DashboardPage() {
  const orders = await getOrders();
  const { totalOrders, totalRevenue, pendingCount } = await getStatusMetrics();
  const revenueData = await getRevenueLast6Months();
  const serviceDistributionData = await getServiceDistribution();
  const orderVolumeData = await getOrdersLast6Months();

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h2>
      </div>
      
      <main className="flex flex-1 flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCards 
            totalOrders={totalOrders}
            totalRevenue={totalRevenue}
            pendingCount={pendingCount}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <RevenueChart data={revenueData} />
          <OrderVolumeChart data={orderVolumeData} />
        </div>
        
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <OrderTableShell data={orders} />
          </div>
          <div>
            <ServiceDistributionChart data={serviceDistributionData} />
          </div>
        </div>
      </main>
    </div>
  );
}
