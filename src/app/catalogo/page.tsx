'use client';

import { useState } from 'react';
import { BookCopy, Plus } from 'lucide-react';
import { ProductCatalogList } from '@/components/catalogo/product-catalog-list';
import { Button } from '@/components/ui/button';
import { CatalogProductFormDialog } from '@/components/catalogo/catalog-product-form-dialog';

export default function CatalogPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
