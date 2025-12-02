

'use client';

import { useCollection } from '@/firebase';
import { Customer } from '@/lib/types';
import { CustomerTableShell } from '@/components/clientes/customer-table-shell';

export default function CustomersPage() {
  const { data: customers, loading } = useCollection<Customer>('customers');

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Clientes
        </h2>
      </div>
      <CustomerTableShell data={customers || []} loading={loading} />
    </div>
  );
}
