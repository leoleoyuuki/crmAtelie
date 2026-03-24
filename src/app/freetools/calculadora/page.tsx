'use client';

import { useState, useEffect } from 'react';
import { QuoteCalculatorForm } from '@/components/calculadora/quote-calculator-form';
import { LeadForm } from '@/components/freetools/lead-form';
import { Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FreetoolCalculadoraPage() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if lead has already been captured
    const savedLead = localStorage.getItem('atelierflow_lead_info');
    if (savedLead) {
      setShowCalculator(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Calculator className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Simplificado para Freetool */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-headline font-black text-xl tracking-tight">AtelierFlow</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
            Conhecer o Sistema
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {!showCalculator ? (
          <div className="py-12 md:py-20 space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tight text-foreground">
                Calculadora de Orçamentos Profissional
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Descubra o preço ideal para seus produtos e serviços em segundos. 
                Considere custo de materiais, sua hora e custos fixos.
              </p>
            </div>

            <LeadForm 
              onSuccess={() => setShowCalculator(true)} 
              toolName="Calculadora de Orçamentos" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10">
                <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
                    <div className="font-bold text-sm uppercase tracking-wider text-primary">Precisão</div>
                    <p className="text-xs text-muted-foreground">Cálculos detalhados baseados na realidade do seu ateliê.</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
                    <div className="font-bold text-sm uppercase tracking-wider text-primary">Simplicidade</div>
                    <p className="text-xs text-muted-foreground">Interface intuitiva focada em resultados rápidos.</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
                    <div className="font-bold text-sm uppercase tracking-wider text-primary">Profissionalismo</div>
                    <p className="text-xs text-muted-foreground">Preços que garantem o seu lucro e a saúde do seu negócio.</p>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black font-headline tracking-tight">Calculadora de Orçamentos</h2>
                    <p className="text-muted-foreground">Preencha os campos abaixo para gerar seu preço.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCalculator(false)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
            </div>
            
            <div className="max-w-6xl mx-auto">
                <QuoteCalculatorForm isPublic />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AtelierFlow - Gestão Inteligente para Ateliês.
          </p>
          <div className="flex items-center justify-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
