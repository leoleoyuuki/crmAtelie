

'use client';

import { usePaginatedCollection } from '@/firebase';
import { Customer } from '@/lib/types';
import { CustomerTableShell } from '@/components/clientes/customer-table-shell';
import { useEffect } from 'react';

export default function CustomersPage() {
  const { data: customers, loading, nextPage, prevPage, hasMore, hasPrev, refresh } = usePaginatedCollection<Customer>('customers');

  // When a customer is created/deleted, we need to refresh the current page
  const handleDataMutation = () => {
    refresh();
  }

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Clientes
        </h2>
      </div>
      <CustomerTableShell 
        data={customers || []} 
        loading={loading}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        hasNextPage={hasMore}
        hasPrevPage={hasPrev}
        onDataMutated={handleDataMutation}
      />
    </div>
  );
}
