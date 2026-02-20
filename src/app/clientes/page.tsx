'use client';

import { usePaginatedCollection } from '@/firebase';
import { Customer } from '@/lib/types';
import { CustomerTableShell } from '@/components/clientes/customer-table-shell';
import { Users, Info } from 'lucide-react';

export default function CustomersPage() {
  const { data: customers, loading, nextPage, prevPage, hasMore, hasPrev, refresh } = usePaginatedCollection<Customer>('customers');

  const handleDataMutation = () => {
    refresh();
  }

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Base de Clientes
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Lista de Contatos
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Segmentação
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Exportação
            </button>
        </div>
      </div>

      {/* Informativo */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-secondary/20 p-2 rounded-xl mt-0.5">
            <Users className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Relacionamento é tudo</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Mantenha os dados dos seus clientes atualizados para facilitar o envio de comprovantes e notificações de retirada via WhatsApp.
            </p>
        </div>
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
