
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { useFirebase, useDocument } from '@/firebase';
import { MessageSquare, LogOut, Loader2, Key, Star, Phone, Printer, Check, ArrowRight } from 'lucide-react';
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
            // 1. Save Phone
            await updateUserProfilePhone(user.uid, phone);
            // 2. Start Trial immediately
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

const PlanCard = ({ 
    title, 
    price, 
    period, 
    subtitle, 
    benefit, 
    isHighlighted, 
    onSelect, 
    isLoading, 
    icon: Icon, 
    buttonText = "Assinar Agora",
    features = []
}: {
  title: string,
  price: string,
  period: string,
  subtitle: string,
  benefit?: string;
  isHighlighted?: boolean,
  onSelect: () => void,
  isLoading?: boolean,
  icon?: any,
  buttonText?: string;
  features?: string[];
}) => {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-card text-card-foreground transition-all duration-300 relative flex flex-col p-6 sm:p-8",
        isHighlighted 
            ? "border-primary ring-4 ring-primary/10 shadow-2xl md:scale-105 z-10 pt-14 sm:pt-16" 
            : "hover:border-muted-foreground/30 shadow-sm"
      )}
    >
      {isHighlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Badge className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl whitespace-nowrap border-2 border-background">
                Recomendado
            </Badge>
        </div>
      )}
      
      <div className="space-y-2 mb-6">
        <h3 className="text-2xl font-bold font-headline">{title}</h3>
        <p className="text-sm text-muted-foreground leading-snug min-h-[40px]">{subtitle}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline flex-wrap gap-1">
          <span className={cn(
              "font-black tracking-tighter",
              price.length > 10 ? "text-2xl" : "text-4xl"
          )}>{price}</span>
          <span className="text-muted-foreground font-medium text-sm">/{period}</span>
        </div>
        {benefit && (
          <p className="text-sm font-extrabold text-primary mt-2 uppercase tracking-wide bg-primary/5 inline-block px-2 py-0.5 rounded">
            {benefit}
          </p>
        )}
      </div>

      <div className="space-y-4 flex-grow mb-8">
        {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
                <div className="bg-primary/10 p-0.5 rounded-full mt-0.5 shrink-0">
                    <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />
                </div>
                <span className="text-sm text-foreground/80 leading-tight">{feature}</span>
            </div>
        ))}
      </div>

      <Button 
        className={cn(
            "w-full h-12 rounded-xl font-bold group",
            isHighlighted ? "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20" : ""
        )} 
        variant={isHighlighted ? "default" : "outline"} 
        disabled={isLoading} 
        onClick={onSelect}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : (
            <>
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
        )}
      </Button>
    </div>
  );
};

const planDetails = {
    mensal: { price: 62.90 },
    anual: { price: 490.00 },
};

function PlanSelectionTab({ profile }: { profile: UserProfile | null }) {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
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

  const handleWhatsAppSpecialClick = () => {
    const phoneNumber = "5511921494313";
    const message = "Olá! Tenho interesse no Combo Automação do AtelierFlow que inclui a impressora térmica.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const createPreference = async (plan: Plan) => {
    if (plan === 'especial') {
        handleWhatsAppSpecialClick();
        return;
    }

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
    setSelectedPlan(plan);
    try {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const userEmail = isDevelopment ? 'test_user_12345678@testuser.com' : user.email;

        const response = await fetch('/api/mercadopago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plan: plan, userId: user.uid, userEmail: userEmail }),
        });
        const data = await response.json();
        if (response.ok && data.init_point) {
            window.location.href = data.init_point;
        } else {
            throw new Error(data.error || 'Erro ao criar preferência de pagamento.');
        }
    } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro de Pagamento', description: error.message || 'Não foi possível iniciar o pagamento. Tente novamente.' });
        setSelectedPlan(null);
        setIsLoading(false);
    }
  };

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
                        <Check className="h-3 w-3" /> Sem cartão de crédito
                    </div>
                </div>
            </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-12">
        <div className="text-center space-y-4 px-4">
            <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="h-5 w-5 rounded-full border-2 border-background bg-muted-foreground/20" />)}
                </div>
                Usado por centenas de artesãos
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight">Escolha o seu plano</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">Seu período de teste terminou. Selecione o plano que melhor se adapta ao momento do seu ateliê.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto px-4 md:px-8">
            <PlanCard 
                title="Plano Mensal"
                price="R$62,90"
                period="mês"
                subtitle="Flexibilidade total para quem está começando agora."
                features={[
                    "Gestão de Pedidos",
                    "Cadastro de Clientes",
                    "Dashboard Financeiro",
                    "Suporte via Email",
                    "Relatórios Básicos"
                ]}
                onSelect={() => createPreference('mensal')}
                isLoading={isLoading && selectedPlan === 'mensal'}
            />
            
            <PlanCard 
                title="Plano Anual"
                price="12x R$49,86"
                period="ano"
                subtitle="O favorito dos ateliês profissionais que buscam economia."
                benefit="2 MESES DE DESCONTO"
                isHighlighted
                features={[
                    "Tudo do Plano Mensal",
                    "Prioridade no Suporte",
                    "R$ 490,00 à vista (Opção PIX)",
                    "Acesso antecipado a recursos",
                    "Menor taxa de renovação"
                ]}
                onSelect={() => createPreference('anual')}
                isLoading={isLoading && selectedPlan === 'anual'}
            />

            <PlanCard 
                title="Combo Automação"
                price="Sob Consulta"
                period="especial"
                subtitle="Hardware + Software. A solução definitiva para seu balcão."
                buttonText="Falar com Consultor"
                icon={Printer}
                features={[
                    "Tudo do Plano Anual",
                    "Impressora Térmica 58mm",
                    "Configuração Remota",
                    "Treinamento VIP",
                    "Garantia Estendida"
                ]}
                onSelect={() => createPreference('especial')}
                isLoading={false}
            />
        </div>
    </div>
  )
}

export default function AtivacaoPage() {
  const { auth } = useFirebase();
  const { user } = useUser();
  const { data: profile, loading: profileLoading } = useDocument<UserProfile>(user ? `users/${user.uid}` : null);

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
    <div className="flex min-h-screen flex-col bg-background/50">
        {/* Header Fixo no Topo para evitar sobreposição */}
        <header className="w-full p-6 md:p-8 shrink-0">
            <div className="flex items-center gap-2 max-w-6xl mx-auto">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-headline font-bold text-xl">AtelierFlow</span>
            </div>
        </header>
        
        {/* Área de Conteúdo Centralizada */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-6xl space-y-12 pb-12">
                {!profile?.phone ? (
                    <div className="max-w-md mx-auto w-full">
                        <PhoneCollectionStep user={user} />
                    </div>
                ) : (
                    <Tabs defaultValue="plan" className="w-full">
                        <div className="flex justify-center mb-8">
                            <TabsList className="bg-muted p-1 rounded-xl">
                                <TabsTrigger value="plan" className="rounded-lg px-8">
                                    {!profile.trialStarted ? "Ativar Teste" : "Planos"}
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-lg px-8">Usar Código</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        <TabsContent value="plan" className="mt-0 outline-none">
                            <PlanSelectionTab profile={profile} />
                        </TabsContent>
                        
                        <TabsContent value="code" className="mt-0 outline-none">
                            <div className="max-w-md mx-auto">
                                <Card className="rounded-3xl shadow-xl p-4">
                                    <CodeActivationTab />
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                <div className="w-full text-center space-y-6">
                    <div className="max-w-xs mx-auto">
                        <Separator className="bg-muted-foreground/20" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Alguma dúvida antes de assinar?
                        </p>
                        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5" onClick={handleWhatsAppClick}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chamar no WhatsApp
                        </Button>
                    </div>
                    
                    <Button
                        variant="link"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => auth.signOut()}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da conta ({user?.email})
                    </Button>
                </div>
            </div>
        </main>
    </div>
  );
}
