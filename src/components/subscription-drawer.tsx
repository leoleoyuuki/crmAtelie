"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Check, Loader2, Copy, CheckCheck, Gift, ExternalLink, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, isValid } from "date-fns";
import type { UserProfile } from "@/lib/types";
import { useUser } from "@/firebase/auth/use-user";
import { useToast } from "@/hooks/use-toast";
import { trackFbqEvent } from '@/lib/fpixel';

type Plan = 'mensal' | 'anual';

const planDetails = {
    mensal: { price: 62.00 },
    anual: { price: 859.00 },
};

const feedbackMessages = [
  {
    name: "Camila R.",
    role: "Ateliê de Bolos",
    message: "Depois que comecei a usar o AtelierFlow, nunca mais perdi um pedido. O sistema é lindo e prático!",
    time: "10:45"
  },
  {
    name: "Juliana M.",
    role: "Confeiteira",
    message: "Vocês são top demais! Nunca vi um sistema tão bonito para confeitaria. Amei!",
    time: "11:21"
  },
  {
    name: "Patricia S.",
    role: "Ateliê Doce Arte",
    message: "Estou explorando todas as funcionalidades e está incrível, lindo, intuitivo. Recomendo!",
    time: "14:32"
  }
];

function BillingToggle({ selected, onChange }: { selected: 'mensal' | 'anual', onChange: (v: 'mensal' | 'anual') => void }) {
  return (
    <div className="inline-flex items-center bg-muted/50 rounded-full p-1 shadow-inner relative border border-black/5 w-max">
      <button
        onClick={() => onChange('mensal')}
        className={cn(
          "px-6 py-2 rounded-full text-sm font-bold transition-all duration-500 relative z-10",
          selected === 'mensal'
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Mensal
      </button>
      <button
        onClick={() => onChange('anual')}
        className={cn(
          "px-6 py-2 rounded-full text-sm font-bold transition-all duration-500 relative z-10 flex items-center gap-1.5",
          selected === 'anual'
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Anual
        {selected !== 'anual' && (
          <span className="absolute -top-2 -right-2 bg-[#10b981] text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-bounce shadow-lg">
            -R$200
          </span>
        )}
      </button>
      
      {/* Animated Background Slide */}
      <div 
        className={cn(
          "absolute inset-y-1 rounded-full bg-primary shadow-lg transition-all duration-500 ease-out z-0",
          selected === 'mensal' ? "left-1 w-[80px]" : "left-[90px] w-[90px]"
        )}
      />
    </div>
  );
}

const features = [
  "Gestão de Pedidos Inteligente",
  "Dashboard Financeiro Analítico",
  "Calculadora de Orçamento",
  "Acesso em Todos os Dispositivos",
  "Suporte Diferenciado via WhatsApp"
];

function CouponCard({ code, label, description }: { code: string; label: string; description: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <div className="group relative bg-gradient-to-br from-muted/60 to-muted/30 border border-primary/15 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="h-4 w-4 text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-primary">{label}</span>
      </div>
      <p className="text-sm text-muted-foreground font-medium mb-4">{description}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-background border-2 border-dashed border-primary/30 rounded-xl px-4 py-3 text-center">
          <span className="text-xl font-black tracking-[0.2em] text-foreground select-all">{code}</span>
        </div>
        <Button
          size="sm"
          variant={copied ? "default" : "outline"}
          className={cn(
            "h-12 w-12 rounded-xl shrink-0 transition-all duration-300 border-2",
            copied
              ? "bg-emerald-500 hover:bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          )}
          onClick={handleCopy}
        >
          {copied ? <CheckCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </Button>
      </div>
      {copied && (
        <p className="text-xs text-emerald-600 font-bold mt-2 text-center animate-in fade-in slide-in-from-bottom-1">✓ Código copiado!</p>
      )}
    </div>
  );
}

export function SubscriptionDrawer({ profile, open, onOpenChange }: { profile: UserProfile | null, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const { user } = useUser();
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [isLoading, setIsLoading] = useState(false);
  const [showCouponScreen, setShowCouponScreen] = useState(false);
  const { toast } = useToast();

  const isTrial = profile?.trialExpiresAt && isValid(profile.trialExpiresAt) && new Date() <= profile.trialExpiresAt;
  const isActive = profile?.status === 'active';

  const daysLeft = isTrial ? Math.max(0, differenceInDays(profile!.trialExpiresAt!, new Date())) : null;

  const createPreference = async (plan: Plan) => {
    trackFbqEvent('InitiateCheckout', {
        content_name: plan,
        currency: 'BRL',
        value: planDetails[plan].price,
    });

    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
        return;
    }
    setIsLoading(true);
    try {
        const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                priceId: plan === 'mensal' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MENSAL : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANUAL, 
                userId: user.uid, 
                userEmail: user.email 
            }),
        });
        const data = await response.json();
        if (response.ok && data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Erro ao criar sessão de checkout.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro de Pagamento', description: error.message || 'Não foi possível iniciar o pagamento. Tente novamente.' });
        setIsLoading(false);
    }
  };

  const handlePortalSession = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const response = await fetch('/api/stripe/create-portal-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
        });
        const data = await response.json();
        if (response.ok && data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Erro ao abrir painel.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Erro ao acessar o portal.' });
        setIsLoading(false);
    }
  };

  return (
      <Sheet open={open} onOpenChange={(v) => {
          if (!v) setShowCouponScreen(false);
          onOpenChange?.(v);
        }}>
        <SheetContent side="bottom" className="p-0 border-t border-primary/20 rounded-t-3xl sm:rounded-none sm:rounded-t-[40px] w-full max-w-none sm:mx-0 sm:right-auto sm:left-0 sm:translate-x-0 h-auto max-h-[95vh] overflow-y-auto bg-background/95 backdrop-blur-xl shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
          <div className="relative overflow-hidden w-full">
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[100%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 lg:py-16 relative z-10 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                
                {/* Feedback side (Hidden on Mobile) */}
                <div className="hidden lg:flex flex-col gap-8 relative z-10 lg:border-r lg:border-primary/10 pr-0 lg:pr-10">
                   <div>
                      <h3 className="text-3xl font-headline font-black mb-3 text-foreground tracking-tight">O que dizem nossas clientes</h3>
                      <p className="text-base text-muted-foreground font-medium">Junte-se a centenas de ateliês que já organizaram suas vendas e multiplicaram seus lucros.</p>
                   </div>
                   <div className="space-y-5">
                     {feedbackMessages.map((fb, i) => (
                        <div key={i} className="bg-muted/40 hover:bg-muted/60 transition-all duration-300 p-5 rounded-3xl relative shadow-sm border border-black/5 hover:border-black/10">
                          <div className="flex items-center gap-3 mb-2.5">
                             <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center font-black text-primary text-lg shadow-inner">
                               {fb.name.charAt(0)}
                             </div>
                             <div className="flex flex-col">
                               <span className="font-bold text-foreground text-sm leading-none">{fb.name}</span>
                               <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{fb.role}</span>
                             </div>
                          </div>
                          <p className="text-sm text-foreground/80 italic font-medium leading-relaxed">&quot;{fb.message}&quot;</p>
                        </div>
                     ))}
                   </div>
                </div>

                {/* Pricing side */}
                <div className="space-y-8 relative z-10 lg:pl-6">
                  <SheetHeader className="text-center lg:text-left space-y-3 mb-6 relative z-10">
                    <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-3 shadow-[inset_0_0_20px_rgba(255,100,100,0.1)]">
                      <Sparkles className="h-7 w-7 text-primary fill-primary/30" />
                    </div>
                    <SheetTitle className="font-headline text-3xl md:text-4xl font-black tracking-tight text-foreground">
                      AtelierFlow <span className="text-primary">Plus</span>
                    </SheetTitle>
                    <SheetDescription className="text-base font-medium text-foreground/70 max-w-md mx-auto lg:mx-0">
                      {isTrial && daysLeft !== null ? (
                        <>Seu período de teste expira em <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded-lg ml-1 mr-1">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span>. <br className="hidden lg:block"/>Assine agora para não perder nenhum dado ou acesso!</>
                      ) : (
                        <>Conheça as vantagens de assinar o plano Anual e economize no AtelierFlow.</>
                      )}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex justify-center lg:justify-start">
                    <BillingToggle selected={billingCycle} onChange={setBillingCycle} />
                  </div>

                  <div className="text-center lg:text-left transition-all duration-300">
                    {billingCycle === 'mensal' ? (
                      <div className="flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-baseline justify-center lg:justify-start gap-1">
                          <span className="text-muted-foreground text-lg">R$</span>
                          <span className="text-6xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">62</span>
                          <span className="text-6xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">,00</span>
                          <span className="text-muted-foreground font-bold text-sm ml-1.5">/mês</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                          Por 3 meses, depois R$97,00/mês. Cancele quando quiser.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-emerald-500/10 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-black tracking-widest uppercase border border-emerald-500/20 shadow-sm flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Economia de R$200
                          </span>
                        </div>
                        <div className="flex items-baseline justify-center lg:justify-start gap-1">
                          <span className="text-muted-foreground text-lg">R$</span>
                          <span className="text-6xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">859</span>
                          <span className="text-6xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">,00</span>
                          <span className="text-muted-foreground font-bold text-sm ml-1.5">/ano</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                          Pagamento único de <span className="line-through opacity-40">R$1.059,00</span> por <span className="font-bold text-foreground">R$859,00</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 max-w-lg mx-auto lg:mx-0">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="bg-primary/10 p-1 rounded-xl shrink-0">
                          <Check className="h-4 w-4 text-primary stroke-[3px]" />
                        </div>
                        <span className="text-sm text-foreground/90 font-bold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Screen - shown before portal redirect */}
                  {showCouponScreen && profile?.stripeCustomerId && (
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-5 mt-2">
                      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-primary/10 p-2 rounded-xl">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-black text-foreground text-base">Cupons de Desconto Exclusivos</h4>
                            <p className="text-xs text-muted-foreground font-medium">Copie e cole ao atualizar seu plano na Stripe</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CouponCard
                          code="ATELIER35"
                          label="Plano Mensal"
                          description="Ganhe R$35 de desconto nos 3 primeiros meses do plano mensal."
                        />
                        <CouponCard
                          code="ANUAL20"
                          label="Plano Anual"
                          description="Desconto de 20% no plano anual. A melhor economia!"
                        />
                      </div>

                      <div className="bg-muted/40 rounded-xl p-4 border border-black/5">
                        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                          <span className="text-primary font-black">Como usar:</span> Copie o cupom desejado acima, clique em <span className="font-black text-foreground">"Ir para o Portal"</span> abaixo, e ao atualizar seu plano, cole o código no campo de promoção.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 h-14 rounded-2xl font-bold border-2"
                          onClick={() => setShowCouponScreen(false)}
                        >
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Voltar
                        </Button>
                        <Button 
                          size="lg"
                          className="flex-1 h-14 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden bg-primary hover:bg-primary/95"
                          onClick={handlePortalSession}
                          disabled={isLoading}
                        >
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                          {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            <span className="flex items-center drop-shadow-sm">
                              IR PARA O PORTAL
                              <ExternalLink className="ml-2 h-5 w-5" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Main CTA Button - hidden when coupon screen is shown */}
                  {!showCouponScreen && (
                    <Button 
                      size="lg"
                      className="w-full lg:max-w-md h-16 text-lg rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden bg-primary hover:bg-primary/95 mt-4"
                      onClick={() => {
                          if (profile?.stripeCustomerId) {
                              setShowCouponScreen(true);
                          } else {
                              createPreference(billingCycle);
                          }
                      }}
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                      
                      {isLoading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        <span className="flex items-center drop-shadow-sm">
                          {profile?.stripeCustomerId ? "GERENCIAR OU ATUALIZAR PLANO" : "ASSINAR ATELIERFLOW PRO"}
                          <ArrowRight className="ml-2.5 h-6 w-6 transition-transform group-hover:translate-x-1.5" />
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <style jsx>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
          `}</style>
          </div>
        </SheetContent>
      </Sheet>
  );
}
