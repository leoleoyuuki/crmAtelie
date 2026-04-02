'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { useFirebase, useDocument } from '@/firebase';
import { MessageSquare, LogOut, Loader2, Key, Star, Phone, Printer, Check, ArrowRight, ArrowLeft, Sparkles, BarChart3, FileText } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { useUser } from '@/firebase/auth/use-user';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { redeemActivationToken, startFreeTrial } from '@/lib/activation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { trackFbqEvent } from '@/lib/fpixel';
import type { UserProfile } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { updateUserProfilePhone } from '@/lib/data';


type Plan = 'mensal' | 'anual' | 'especial';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '', { locale: 'pt-BR' });


function PhoneCollectionStep({ user }: { user: any }) {
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleActivateFreeTrial = async () => {
        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
            toast({ variant: 'destructive', title: 'Número Inválido', description: 'Por favor, informe seu número de WhatsApp completo com DDD.' });
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfilePhone(user.uid, phone);
            await startFreeTrial(user);
            
            toast({ title: 'Sucesso!', description: 'Seu período de 7 dias grátis começou. Bem-vindo(a)!' });
            router.push('/');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível completar seu cadastro.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-primary ring-1 ring-primary/20 shadow-xl">
            <CardHeader className="text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-6 w-6 text-primary fill-current" />
                </div>
                <CardTitle className="font-headline text-2xl">Ative seus 7 dias Grátis</CardTitle>
                <CardDescription>
                    Informe seu WhatsApp para completar o cadastro e acessar o sistema agora mesmo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp (com DDD)</Label>
                    <Input 
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                        className="text-lg py-6"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleActivateFreeTrial} className="w-full text-lg py-6" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Ativar meu Teste Grátis"}
                </Button>
            </CardFooter>
        </Card>
    )
}


function CodeActivationTab() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { auth } = useFirebase();
  const user = auth.currentUser;

  const handleActivation = async () => {
    if (!token.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, insira um código de ativação.',
      });
      return;
    }
    
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Usuário não autenticado. Faça login novamente.',
        });
        return;
    }

    setIsLoading(true);
    try {
      await redeemActivationToken(user, token);
      toast({
        title: 'Conta Ativada!',
        description: 'Sua conta foi ativada com sucesso. Bem-vindo!',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha na Ativação',
        description: error.message || 'Não foi possível ativar sua conta. Verifique o código e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
       <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="font-headline text-2xl">Ativação por Código</CardTitle>
          <CardDescription>
            Insira o código de ativação para liberar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-2">
            <Input
              id="token"
              placeholder="Ex: XXXX-XXXX-XXXX"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
              className="font-mono text-center text-lg h-12 uppercase"
            />
             <p className="text-xs text-muted-foreground pt-1">
                Adquiriu um código físico ou via suporte? Ative-o acima.
             </p>
          </div>
        </CardContent>
        <CardFooter className="px-0 pb-0">
          <Button onClick={handleActivation} disabled={isLoading} className="w-full h-12">
            <Key className="mr-2 h-4 w-4" />
            {isLoading ? 'Ativando...' : 'Ativar Agora'}
          </Button>
        </CardFooter>
      </Card>
  )
}

const planDetails = {
    mensal: { price: 62.00 },
    anual: { price: 859.00 },
};

/* ====================
   BILLING TOGGLE
   ==================== */
function BillingToggle({ selected, onChange }: { selected: 'mensal' | 'anual', onChange: (v: 'mensal' | 'anual') => void }) {
  return (
    <div className="inline-flex items-center bg-muted/50 rounded-full p-1.5 shadow-inner relative border border-black/5">
      <button
        onClick={() => onChange('mensal')}
        className={cn(
          "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-500 relative z-10",
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
          "px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-500 relative z-10 flex items-center gap-1.5",
          selected === 'anual'
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Anual
        {selected !== 'anual' && (
          <span className="absolute -top-3 -right-2 bg-[#E11D48] text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce shadow-lg">
            -R$200
          </span>
        )}
      </button>
      
      {/* Animated Background Slide */}
      <div 
        className={cn(
          "absolute inset-y-1.5 rounded-full bg-primary shadow-lg transition-all duration-500 ease-out z-0",
          selected === 'mensal' ? "left-1.5 w-[90px]" : "left-[100px] w-[100px]"
        )}
      />
    </div>
  )
}

/* ====================
   FEATURES IA SECTION
   ==================== */
const iaFeatures = [
  {
    icon: Sparkles,
    title: "Gestão de Pedidos Inteligente",
    description: "Organize todos os pedidos do seu ateliê com status, prazos e alertas automáticos."
  },
  {
    icon: BarChart3,
    title: "Dashboard Financeiro Completo",
    description: "Controle total do caixa, receitas e custos do seu ateliê em um só lugar."
  },
  {
    icon: FileText,
    title: "Relatórios e Fichas Técnicas",
    description: "Gere fichas técnicas profissionais e relatórios detalhados de forma automática."
  }
];

/* ====================
   FEEDBACK SECTION
   ==================== */
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

/* ====================
   PLAN SELECTION (REDESIGNED)
   ==================== */
function PlanSelectionTab({ profile, onWhatsAppClick }: { profile: UserProfile | null, onWhatsAppClick: (e: React.MouseEvent) => void }) {
  const { user } = useUser();
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [isLoading, setIsLoading] = useState(false);
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const handleStartTrial = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para iniciar um teste.' });
        return;
    }
    setIsTrialLoading(true);
    try {
        await startFreeTrial(user);
        toast({ title: 'Período de teste ativado!', description: 'Aproveite o acesso completo por 7 dias. Bem-vindo(a)!' });
        router.push('/');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Falha na ativação do teste', description: error.message });
    } finally {
        setIsTrialLoading(false);
    }
  };

  const createPreference = async (plan: Plan) => {
    trackFbqEvent('InitiateCheckout', {
        content_name: plan,
        currency: 'BRL',
        value: (planDetails as any)[plan].price,
    });

    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para iniciar um pagamento.' });
        return;
    }
    setIsLoading(true);
    try {
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro de Pagamento', description: error.message || 'Não foi possível iniciar o pagamento. Tente novamente.' });
        setIsLoading(false);
    }
  };

  // Free trial card (before trial started)
  if (!profile?.trialStarted) {
      return (
        <Card className="border-primary bg-primary/5 shadow-2xl max-w-md mx-auto rounded-3xl p-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Star className="h-32 w-32 fill-primary" />
            </div>
            <CardHeader className="text-center relative z-10">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary fill-current" />
                </div>
                <CardTitle className="font-headline text-3xl text-primary">Teste Grátis</CardTitle>
                <CardDescription className="text-base font-medium">
                    Experimente o sistema completo por 7 dias sem pagar nada.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 relative z-10">
                <Button
                    size="lg"
                    className="w-full text-lg py-8 shadow-xl hover:scale-105 transition-transform rounded-2xl font-bold"
                    onClick={handleStartTrial}
                    disabled={isTrialLoading}
                >
                    {isTrialLoading ? <Loader2 className="animate-spin" /> : (
                        <>
                            Ativar meus 7 Dias Grátis
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
                <div className="mt-6 flex flex-col gap-2 items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3" /> Acesso a todos os recursos
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3" /> Cartão ou Pix (via revendedor)
                    </div>
                </div>
            </CardContent>
        </Card>
      );
  }

  // ==============================
  // MAIN: POST-TRIAL PLAN SELECTION
  // ==============================
  const features = [
    "Gestão de Pedidos Completa",
    "Cadastro de Clientes",
    "Dashboard Financeiro",
    "Suporte via WhatsApp",
    "Relatórios Profissionais",
    "PDFs sem marca d'água",
  ];

  return (
    <div>
      {/* === TWO COLUMN LAYOUT === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto px-4">
        
        {/* ===== LEFT: PRICING CARD ===== */}
        <div className="space-y-4">
          {/* Toggle */}
          <BillingToggle selected={billingCycle} onChange={setBillingCycle} />

          {/* Plan Name */}
          <h2 className="text-2xl md:text-3xl font-black font-headline tracking-tight text-foreground">
            AtelierFlow Pro
          </h2>

          {/* Price */}
          <div className="relative">
            {billingCycle === 'mensal' ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-muted-foreground text-base">R$</span>
                  <span className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">62</span>
                  <span className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">,00</span>
                  <span className="text-muted-foreground font-medium text-sm ml-1">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Por 3 meses, depois R$97,00/mês
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-muted-foreground text-base">R$</span>
                      <span className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">859</span>
                      <span className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">,00</span>
                      <span className="text-muted-foreground font-medium text-sm ml-1">/ano</span>
                    </div>
                    <span className="bg-primary/10 text-primary text-[11px] px-2.5 py-1 rounded-full font-bold border border-primary/20">
                      ECONOMIZE R$ 200
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Pagamento único de <span className="line-through opacity-50">R$1.059,00</span> <span className="font-bold text-foreground">R$859,00</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Features — 2 columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-primary/15 p-0.5 rounded-full shrink-0">
                  <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />
                </div>
                <span className="text-sm text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            size="lg"
            className="w-full max-w-sm text-base py-7 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] group relative overflow-hidden bg-primary hover:bg-primary/90"
            onClick={() => createPreference(billingCycle)}
            disabled={isLoading}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                ASSINAR ATELIERFLOW
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </>
            )}
          </Button>
          
          <div className="flex justify-center">
            <button 
              onClick={onWhatsAppClick}
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-all border-none bg-transparent cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Não tem cartão? Assine via Pix com um revendedor
            </button>
          </div>

          <style jsx>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>

        {/* ===== RIGHT: FEEDBACK + IA ===== */}
        <div className="space-y-4">
          {/* Feedback Section */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Feedback de Usuários
            </h3>
            <div className="space-y-2.5">
              {feedbackMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl px-3 py-2.5 max-w-[85%]",
                    i % 2 === 0
                      ? "bg-primary/5 border border-primary/10 mr-auto"
                      : "bg-muted ml-auto"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-primary">{msg.name}</span>
                    <span className="text-[9px] text-muted-foreground">· {msg.role}</span>
                  </div>
                  <p className="text-[13px] text-foreground/80 leading-snug">{msg.message}</p>
                  <span className="text-[9px] text-muted-foreground float-right mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IA Features Section */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              AtelierFlow — Recursos
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {iaFeatures.map((feature, i) => (
                <div key={i} className="text-center space-y-1.5">
                  <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-tight">{feature.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-snug">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function AtivacaoPage() {
  const { auth } = useFirebase();
  const { user } = useUser();
  const { data: profile, loading: profileLoading } = useDocument<UserProfile>(user ? `users/${user.uid}` : null);
  const [activeTab, setActiveTab] = useState('plan');

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phoneNumber = "5511921494313";
    const message = "Olá! Gostaria de tirar uma dúvida sobre a assinatura do sistema AtelierFlow.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (profileLoading) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-background">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F3] relative overflow-hidden">
        {/* === DECORATIVE GRADIENTS/GLOWS === */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle mesh background pattern */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

        <header className="w-full px-6 py-3 md:px-8 md:py-4 shrink-0 relative z-10">
            <div className="flex items-center gap-2 max-w-6xl mx-auto">
                <Logo className="h-7 w-7 text-primary" />
                <span className="font-headline font-bold text-lg text-foreground">AtelierFlow</span>
            </div>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 md:px-8 md:py-4 relative z-10">
            <div className="w-full max-w-6xl space-y-6">
                {!profile?.phone ? (
                    <div className="max-w-md mx-auto w-full">
                        <PhoneCollectionStep user={user} />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsContent value="plan" className="mt-0 outline-none">
                            <PlanSelectionTab profile={profile} onWhatsAppClick={handleWhatsAppClick} />
                        </TabsContent>
                        
                        <TabsContent value="code" className="mt-0 outline-none">
                            <div className="max-w-md mx-auto space-y-4">
                                <button
                                    onClick={() => setActiveTab('plan')}
                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar aos Planos
                                </button>
                                <Card className="rounded-3xl shadow-xl p-4 border-white/20 bg-white/60 backdrop-blur-md">
                                    <CodeActivationTab />
                                </Card>
                            </div>
                        </TabsContent>

                        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-2">
                            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 w-full sm:w-auto" onClick={handleWhatsAppClick}>
                                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                Chamar no WhatsApp
                            </Button>
                            <span className="hidden sm:inline text-muted-foreground/30">|</span>
                            {activeTab === 'plan' ? (
                                <button
                                    onClick={() => setActiveTab('code')}
                                    className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none px-0 py-2 sm:py-0 w-full sm:w-auto"
                                >
                                    <Key className="mr-1.5 h-3.5 w-3.5" />
                                    Usar Código
                                </button>
                            ) : (
                                <button
                                    onClick={() => setActiveTab('plan')}
                                    className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none px-0 py-2 sm:py-0 w-full sm:w-auto"
                                >
                                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                                    Ver Planos
                                </button>
                            )}
                            <span className="hidden sm:inline text-muted-foreground/30">|</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground transition-colors w-full sm:w-auto"
                                onClick={() => auth.signOut()}
                            >
                                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                                Sair ({user?.email})
                            </Button>
                        </div>
                    </Tabs>
                )}
            </div>
        </main>
    </div>
  );
}
