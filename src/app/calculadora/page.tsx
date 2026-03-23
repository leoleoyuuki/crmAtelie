'use client';

import { QuoteCalculatorForm } from '@/components/calculadora/quote-calculator-form';
import { Calculator } from 'lucide-react';

export default function CalculadoraPage() {
  return (
    <div className="flex-1 space-y-8 px-4 pt-8 md:px-10 pb-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight font-headline text-foreground">
          Calculadora de Orçamentos
        </h2>
        <p className="text-muted-foreground max-w-2xl">
          Calcule rapidamente o preço final do seu produto considerando os custos com material, 
          hora da profissional, custo do ateliê (imóvel) e sua meta de margem de lucro.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-primary/10 p-2 rounded-xl mt-0.5">
            <Calculator className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Como Funciona</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Preencha os dados abaixo. O sistema calculará o seu custo e preço de venda sugerido. 
                Você pode salvar o resultado no seu Catálogo de Produtos para referência futura.
            </p>
        </div>
      </div>

      <div className="max-w-5xl">
        <QuoteCalculatorForm />
      </div>
    </div>
  );
}
