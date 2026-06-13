'use client';

import { QuoteCalculatorForm } from '@/components/calculadora/quote-calculator-form';
import { Calculator, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CalculadoraPage() {
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('atelierflow_onboarding_checklist_dismissed') === 'true';
      setIsOnboarding(!isDismissed);
    }
  }, []);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={isOnboarding ? "lg:col-span-8" : "lg:col-span-12"}>
          <QuoteCalculatorForm />
        </div>
        
        {isOnboarding && (
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 space-y-5 shadow-sm">
              <h3 className="font-headline font-black text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Guia do Orçamento
              </h3>
              <div className="space-y-4 text-xs">
                <div className="border-l-2 border-primary pl-3 py-1 space-y-1">
                  <span className="font-bold text-primary">1. Nome e Descrição</span>
                  <p className="text-muted-foreground leading-relaxed">Nomeie seu serviço (ex: "Bainha de Calça" ou "Vestido Sob Medida").</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-3 py-1 space-y-1">
                  <span className="font-bold text-foreground">2. Mão de Obra</span>
                  <p className="text-muted-foreground leading-relaxed">Defina o custo da sua hora de trabalho e quantas horas vai levar.</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-3 py-1 space-y-1">
                  <span className="font-bold text-foreground">3. Custo do Ateliê</span>
                  <p className="text-muted-foreground leading-relaxed">Preencha o custo fixo (imóvel) se quiser diluir as despesas por hora.</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-3 py-1 space-y-1">
                  <span className="font-bold text-foreground">4. Insumos e Materiais</span>
                  <p className="text-muted-foreground leading-relaxed">Adicione os materiais que usará e seus valores individuais.</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-3 py-1 space-y-1">
                  <span className="font-bold text-foreground">5. Margem de Lucro</span>
                  <p className="text-muted-foreground leading-relaxed">Insira qual a margem (porcentagem ou valor fixo) que deseja lucrar.</p>
                </div>
                <div className="border-l-2 border-primary/40 pl-3 py-1 space-y-1">
                  <span className="font-bold text-foreground">6. Salvar no Catálogo</span>
                  <p className="text-muted-foreground leading-relaxed font-bold text-primary">Para concluir esta etapa do checklist, você deve clicar no botão "Salvar no Catálogo" no final do formulário.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
