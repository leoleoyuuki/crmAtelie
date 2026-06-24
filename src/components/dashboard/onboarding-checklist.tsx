'use client';

import { useState, useEffect } from 'react';
import { useCollection } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, usePathname } from 'next/navigation';
import { Order, Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Calendar, 
  Calculator, 
  Wallet, 
  ShoppingBag, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock,
  Tags,
  ClipboardList,
  X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function OnboardingChecklist() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [isDismissed, setIsDismissed] = useState(false);
  const [visitedTarefas, setVisitedTarefas] = useState(false);
  const [visitedFluxoCaixa, setVisitedFluxoCaixa] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Queries to check databases (highly reactive as Firestore updates in real-time)
  const { data: orders } = useCollection<Order>('orders');
  const { data: sales } = useCollection<Sale>('sales');
  const { data: catalogProducts } = useCollection<any>('catalogProducts');
  const { data: fixedCosts } = useCollection<any>('fixedCosts');
  const { data: purchases } = useCollection<any>('purchases');

  const uId = user?.uid || 'guest';

  // Auto-open on navigation
  useEffect(() => {
    setIsOpen(true);
  }, [pathname]);

  // Visited state sync
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      setIsDismissed(localStorage.getItem(`atelierflow_${uId}_checklist_dismissed`) === 'true');
      setVisitedTarefas(localStorage.getItem(`atelierflow_${uId}_visited_tarefas`) === 'true');
      setVisitedFluxoCaixa(localStorage.getItem(`atelierflow_${uId}_visited_fluxo_caixa`) === 'true');

      const handleStorageChange = () => {
        setVisitedTarefas(localStorage.getItem(`atelierflow_${uId}_visited_tarefas`) === 'true');
        setVisitedFluxoCaixa(localStorage.getItem(`atelierflow_${uId}_visited_fluxo_caixa`) === 'true');
      };
      
      const handleCustomVisit = () => {
        setVisitedTarefas(localStorage.getItem(`atelierflow_${uId}_visited_tarefas`) === 'true');
        setVisitedFluxoCaixa(localStorage.getItem(`atelierflow_${uId}_visited_fluxo_caixa`) === 'true');
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('onboarding-visit-update', handleCustomVisit);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('onboarding-visit-update', handleCustomVisit);
      };
    }
  }, [user, uId]);

  const dismissChecklist = () => {
    localStorage.setItem(`atelierflow_${uId}_checklist_dismissed`, 'true');
    setIsDismissed(true);
  };

  const hasOrders = orders !== null && orders.length > 0;
  const hasCompletedOrder = orders !== null && orders.some(o => o.status === 'Concluído');
  const hasCatalog = catalogProducts !== null && catalogProducts.length > 0;
  const hasFixedCosts = fixedCosts !== null && fixedCosts.length > 0;
  const hasPurchases = purchases !== null && purchases.length > 0;

  // Highlight recent orders section
  const handleScrollToOrders = () => {
    setIsOpen(false); // Minimize so it doesn't block the click area
    router.push('/');
    setTimeout(() => {
      const section = document.getElementById('recent-orders-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        section.classList.remove('border-transparent');
        section.classList.add('border-primary/50', 'bg-primary/5', 'ring-4', 'ring-primary/20');
        
        setTimeout(() => {
          section.classList.remove('border-primary/50', 'bg-primary/5', 'ring-4', 'ring-primary/20');
          section.classList.add('border-transparent');
        }, 3500);
      }
    }, 300);
  };

  // Re-open checklist automatically when an order is completed
  useEffect(() => {
    if (hasCompletedOrder) {
      setIsOpen(true);
    }
  }, [hasCompletedOrder]);

  // Raw checklist steps definition
  const rawSteps = [
    {
      id: 'add_order',
      title: '1. Adicionar o primeiro pedido',
      description: 'Cadastre seu primeiro pedido no botão "Adicionar > Novo Pedido". O cliente será criado junto.',
      isCompleted: hasOrders,
      actionLabel: 'Criar Pedido',
      icon: PlusCircle,
      action: () => {
        window.dispatchEvent(new CustomEvent('onboarding-open-order'));
      }
    },
    {
      id: 'view_tasks',
      title: '2. Ver o pedido nas tarefas',
      description: 'Entre na página de Tarefas e veja a entrega do seu pedido agendada automaticamente.',
      isCompleted: visitedTarefas,
      actionLabel: 'Ir para Tarefas',
      icon: Calendar,
      action: () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`atelierflow_${uId}_just_visited_tarefas`, 'true');
        }
        router.push('/tarefas');
      }
    },
    {
      id: 'complete_order',
      title: '3. Concluir um pedido',
      description: 'Conclua seu pedido para ver o faturamento subir e o gráfico financeiro ser atualizado.',
      isCompleted: hasCompletedOrder,
      actionLabel: 'Localizar Pedido',
      icon: CheckCircle2,
      action: handleScrollToOrders
    },
    {
      id: 'register_sale',
      title: '4. Registrar uma venda direta',
      description: 'Lance uma venda pronta-entrega no menu "Adicionar > Registrar Venda" para faturamento rápido.',
      isCompleted: sales !== null && sales.length > 0,
      actionLabel: 'Registrar Venda',
      icon: Tags,
      action: () => {
        window.dispatchEvent(new CustomEvent('onboarding-open-sale'));
      }
    },
    {
      id: 'calculate_quote',
      title: '5. Fazer orçamento na calculadora',
      description: 'Calcule o preço de venda ideal e salve o produto em seu catálogo para referência.',
      isCompleted: hasCatalog,
      actionLabel: 'Abrir Calculadora',
      icon: Calculator,
      href: '/calculadora'
    },
    {
      id: 'add_cost',
      title: '6. Registrar contas e despesas',
      description: 'Lance suas primeiras despesas fixas ou variáveis no controle financeiro.',
      isCompleted: hasFixedCosts,
      actionLabel: 'Registrar Despesa',
      icon: Wallet,
      action: () => {
        window.dispatchEvent(new CustomEvent('onboarding-open-cost'));
      }
    },
    {
      id: 'add_purchase',
      title: '7. Registrar compra de materiais',
      description: 'Cadastre a compra de insumos e veja o estoque ser alimentado de forma inteligente.',
      isCompleted: hasPurchases,
      actionLabel: 'Registrar Compra',
      icon: ShoppingBag,
      action: () => {
        window.dispatchEvent(new CustomEvent('onboarding-open-purchase'));
      }
    },
    {
      id: 'view_cashflow',
      title: '8. Acompanhar o fluxo de caixa',
      description: 'Veja todas as entradas dos pedidos e saídas das despesas em um gráfico consolidado.',
      isCompleted: visitedFluxoCaixa,
      actionLabel: 'Acessar Fluxo de Caixa',
      icon: TrendingUp,
      action: () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`atelierflow_${uId}_just_visited_fluxo_caixa`, 'true');
        }
        router.push('/fluxo-caixa');
      }
    }
  ];

  // Process steps with sequential unlocking logic
  const steps = rawSteps.map((step, index) => {
    // A step is unlocked only if it is the first one or the previous one is completed
    const isUnlocked = index === 0 || rawSteps[index - 1].isCompleted;
    return {
      ...step,
      isUnlocked
    };
  });

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const allCompleted = completedCount === steps.length;

  // Initial highlight overlay logic
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const dismissed = localStorage.getItem(`atelierflow_${uId}_checklist_dismissed`) === 'true';
      const overlaySeen = localStorage.getItem(`atelierflow_${uId}_onboarding_overlay_seen`) === 'true';
      
      if (!dismissed && !overlaySeen && completedCount < steps.length) {
        setShowOverlay(true);
      }
    }
  }, [user, uId, completedCount, steps.length, isDismissed]);

  const handleOverlayClick = () => {
    setShowOverlay(false);
    if (user) {
      localStorage.setItem(`atelierflow_${uId}_onboarding_overlay_seen`, 'true');
    }
  };

  // Render nothing if dismissed
  if (isDismissed) return null;

  return (
    <>
      {/* ── HIGHLIGHT BACKDROP OVERLAY ── */}
      {showOverlay && (
        <div 
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 cursor-pointer animate-in fade-in"
          title="Clique em qualquer lugar para dispensar o destaque"
        />
      )}

      {/* ── LAUNCHER FLOATING BUTTON (Bottom Right) ── */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-12 px-5 rounded-full shadow-2xl flex items-center gap-2 border font-bold transition-all hover:scale-105 active:scale-95 duration-200",
            isOpen 
              ? "bg-stone-900 text-white border-stone-850 hover:bg-stone-800" 
              : "bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:bg-primary/95"
          )}
        >
          {isOpen ? (
            <>
              <X className="h-4 w-4 shrink-0" />
              <span>Fechar Guia</span>
            </>
          ) : (
            <>
              <ClipboardList className="h-5 w-5 shrink-0" />
              <span>Jornada do Ateliê</span>
              <span className="h-5 px-1.5 min-w-5 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center">
                {completedCount}/{steps.length}
              </span>
            </>
          )}
        </Button>
      </div>

      {/* ── CHECKLIST EXPANDED PANEL (Fixed right above button) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[70vh] flex flex-col bg-white border border-stone-300 shadow-2xl overflow-hidden rounded-2xl animate-in"
          >
            {/* Top thin accent strip (Olive Green) */}
            <div className="h-1.5 w-full bg-gradient-to-r from-secondary/60 via-secondary to-secondary/40" />

            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-foreground">
                    Jornada de Introdução
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Configure seu ateliê passo a passo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full">
                  {completedCount}/{steps.length} Concluído
                </span>
              </div>
            </div>

            {/* Progress Area */}
            <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1">
                <span>Progresso geral</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-stone-200" />
            </div>

            {/* Steps Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 modern-scrollbar max-h-[40vh] bg-white">
              {allCompleted ? (
                <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary animate-bounce">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Incrível! Introdução concluída com sucesso! 🎉</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Você completou todos os passos do guia. Agora o painel está totalmente funcional com seus dados. Fique à vontade para continuar explorando o ateliê!
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-2 text-xs font-bold border-secondary/20 hover:bg-secondary/5 w-full rounded-xl"
                    onClick={dismissChecklist}
                  >
                    Ocultar Guia para Sempre
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div 
                        key={step.id} 
                        className={cn(
                          "flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300",
                          step.isCompleted 
                            ? "bg-stone-50/70 border-stone-200/80 opacity-60" 
                            : !step.isUnlocked
                            ? "bg-stone-100/30 border-stone-200/30 opacity-40 select-none"
                            : "bg-primary/[0.02] border-primary/45 shadow-sm ring-1 ring-primary/10"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {step.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-secondary fill-secondary/5" />
                          ) : !step.isUnlocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground/30" />
                          ) : (
                            <Circle className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-bold text-xs leading-snug flex items-center gap-1.5",
                            step.isCompleted ? "text-muted-foreground line-through" : "text-foreground",
                            !step.isUnlocked && "text-muted-foreground/50"
                          )}>
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                            {step.description}
                          </p>

                          {step.isUnlocked && !step.isCompleted && (
                            <div className="mt-2">
                              {step.href ? (
                                <Link href={step.href}>
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="h-7 px-3 text-[10px] rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/95 gap-1 shadow-sm mt-1"
                                  >
                                    {step.actionLabel}
                                    <ArrowRight className="h-3 w-3" />
                                  </Button>
                                </Link>
                              ) : (
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => {
                                    step.action?.();
                                  }}
                                  className="h-7 px-3 text-[10px] rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/95 gap-1 shadow-sm mt-1"
                                >
                                  {step.actionLabel}
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Panel */}
            <div className="p-4 border-t border-muted/20 bg-stone-50 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={dismissChecklist}
                className="text-[10px] font-bold text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-lg"
              >
                Ocultar Guia para Sempre
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-primary hover:bg-primary/5 h-8 px-2.5 rounded-lg"
              >
                Minimizar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
