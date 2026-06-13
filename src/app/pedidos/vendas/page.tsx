'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { usePaginatedCollection } from '@/firebase';
import { Sale } from '@/lib/types';
import { SalesList } from '@/components/vendas/sales-list';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SalesHistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [showOnboardingGuidance, setShowOnboardingGuidance] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const justRegistered = localStorage.getItem(`atelierflow_${user.uid}_just_registered_sale`) === 'true';
      if (justRegistered) {
        setShowOnboardingGuidance(true);
      }
    }
  }, [user]);

  const handleDismissGuidance = () => {
    if (user) {
      localStorage.removeItem(`atelierflow_${user.uid}_just_registered_sale`);
    }
    setShowOnboardingGuidance(false);
    router.push('/');
  };

  const { data: sales, loading, nextPage, prevPage, hasMore, hasPrev } = usePaginatedCollection<Sale>('sales', 15);

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
       <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Gestão de Pedidos
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <Link href="/pedidos" className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Fluxo de Trabalho
            </Link>
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Histórico de Vendas
            </button>
            <Link href="/implementando" className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Relatórios
            </Link>
        </div>
      </div>

      {showOnboardingGuidance && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-background/95 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-xl shadow-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-foreground">Jornada de Introdução: Histórico de Vendas</p>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Sua venda pronta-entrega foi registrada com sucesso nesta lista!
              </p>
            </div>
          </div>
          <Button 
            onClick={handleDismissGuidance}
            className="text-xs font-bold gap-1.5 h-10 px-4 rounded-xl shrink-0 w-full sm:w-auto shadow-lg shadow-primary/10"
          >
            Voltar para o Checklist
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-xl mt-0.5">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Histórico de Vendas Diretas</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Aqui estão listadas todas as vendas de itens à pronta-entrega e os faturamentos extras que não requerem gestão de fluxo de pedido. O agrupamento desses faturamentos ocorre automaticamente no seu dashboard principal.
            </p>
        </div>
      </div>

      {loading && !sales?.length ? (
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      ) : (
        <SalesList 
            data={sales || []} 
            onNextPage={nextPage}
            onPrevPage={prevPage}
            hasNextPage={hasMore}
            hasPrevPage={hasPrev}
            loading={loading}
        />
      )}
    </div>
  );
}
