'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePaginatedCollection } from '@/firebase';
import { Material } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialTableShell } from '@/components/estoque/material-table-shell';
import { Archive, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EstoquePage() {
  const router = useRouter();
  const [showOnboardingGuidance, setShowOnboardingGuidance] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const justPurchased = localStorage.getItem('atelierflow_onboarding_just_purchased') === 'true';
      if (justPurchased) {
        setShowOnboardingGuidance(true);
      }
    }
  }, []);

  const handleDismissGuidance = () => {
    localStorage.removeItem('atelierflow_onboarding_just_purchased');
    setShowOnboardingGuidance(false);
    router.push('/');
  };

  const { 
    data: materials, 
    loading, 
    nextPage, 
    prevPage, 
    hasMore, 
    hasPrev, 
    refresh 
  } = usePaginatedCollection<Material>('materials');

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Inventário de Materiais
        </h2>
        
        <div className="flex items-center gap-6 border-b pb-1 overflow-x-auto no-scrollbar">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-3 whitespace-nowrap">
                Lista de Insumos
            </button>
            <Link href="/implementando" className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Alertas de Reposição
            </Link>
            <Link href="/implementando" className="text-sm font-medium text-muted-foreground hover:text-foreground pb-3 whitespace-nowrap transition-colors">
                Relatórios de Consumo
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
              <p className="text-xs font-bold text-foreground">Jornada de Introdução: Estoque de Materiais</p>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Sua compra de material entrou automaticamente aqui no inventário!
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

      {/* Banner Informativo Estilo Patreon */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-secondary/20 p-2 rounded-xl mt-0.5">
            <Archive className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Gestão Inteligente</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Seu estoque é atualizado automaticamente: as entradas são feitas via <strong>Registro de Compras</strong> e as saídas ao <strong>Concluir um Pedido</strong>.
            </p>
        </div>
      </div>

       {loading && !materials?.length ? (
        <Skeleton className="h-[600px] w-full rounded-3xl" />
      ) : (
        <MaterialTableShell 
          data={materials || []}
          loading={loading}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          hasNextPage={hasMore}
          hasPrevPage={hasPrev}
        />
      )}
    </div>
  );
}
