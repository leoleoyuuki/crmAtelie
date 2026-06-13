'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { BookCopy, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { ProductCatalogList } from '@/components/catalogo/product-catalog-list';
import { Button } from '@/components/ui/button';
import { CatalogProductFormDialog } from '@/components/catalogo/catalog-product-form-dialog';

export default function CatalogPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOnboardingGuidance, setShowOnboardingGuidance] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const justSaved = localStorage.getItem(`atelierflow_${user.uid}_just_saved_quote`) === 'true';
      if (justSaved) {
        setShowOnboardingGuidance(true);
      }
    }
  }, [user]);

  const handleDismissGuidance = () => {
    if (user) {
      localStorage.removeItem(`atelierflow_${user.uid}_just_saved_quote`);
    }
    setShowOnboardingGuidance(false);
    router.push('/');
  };

  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
            Catálogo de Produtos
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Visualize os produtos que você precificou e salvou através da Calculadora. 
            Acompanhe os custos atualizados e suas margens reais.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2 font-bold shadow-md h-11 px-6 whitespace-nowrap">
          <Plus className="h-5 w-5" /> Novo Produto
        </Button>
      </div>

      {showOnboardingGuidance && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-background/95 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-xl shadow-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-foreground">Jornada de Introdução: Catálogo de Produtos</p>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Seu orçamento foi salvo com sucesso aqui no Catálogo!
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

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-xl mt-0.5">
            <BookCopy className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Seu Acervo</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Aqui estão armazenados os orçamentos e produtos salvos. Estes produtos não são 
                apresentados diretamente para o cliente, mas servem como a sua base de custos padrão.
            </p>
        </div>
      </div>

      <ProductCatalogList onAddProduct={() => setIsDialogOpen(true)} />

      <CatalogProductFormDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
