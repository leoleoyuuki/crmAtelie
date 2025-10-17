import { getOrders, getRevenueLast6Months, getServiceDistribution, getStatusMetrics } from '@/lib/data';
import PageHeader from '@/components/dashboard/page-header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ServiceDistributionChart } from '@/components/dashboard/service-distribution-chart';
import OrderTableShell from '@/components/dashboard/order-table-shell';

export default async function DashboardPage() {
  const orders = await getOrders();
  const { inProcessCount, awaitingPickupCount } = await getStatusMetrics();
  const revenueData = await getRevenueLast6Months();
  const serviceDistributionData = await getServiceDistribution();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <PageHeader />
        
        <main className="flex flex-1 flex-col gap-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCards 
              inProcessCount={inProcessCount}
              awaitingPickupCount={awaitingPickupCount}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RevenueChart data={revenueData} />
            </div>
            <div className="lg:col-span-2">
              <ServiceDistributionChart data={serviceDistributionData} />
            </div>
          </div>
          
          <OrderTableShell data={orders} />

        </main>
      </div>
    </div>
  );
}
