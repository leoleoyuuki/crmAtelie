'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { useFirebase, useDocument } from '@/firebase';
import { MessageSquare, LogOut, Loader2, Key, Star, Phone } from 'lucide-react';
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


type Plan = 'mensal' | 'trimestral' | 'anual';

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
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Ativação por Código</CardTitle>
          <CardDescription>
            Insira o código de ativação que você recebeu para liberar o acesso ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input
              id="token"
              placeholder="Cole seu código aqui"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
             <p className="text-xs text-muted-foreground pt-1">
                Se você não tem um código, fale conosco no WhatsApp para adquirir um ou tirar dúvidas.
             </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleActivation} disabled={isLoading} className="w-full">
            <Key className="mr-2 h-4 w-4" />
            {isLoading ? 'Ativando...' : 'Ativar Conta'}
          </Button>
        </CardFooter>
      </Card>
  )
}

const PlanCard = ({ title, price, period, subtitle, benefit, isHighlighted, onSelect, isLoading }: {
  title: string,
  price: string,
  period: string,
  subtitle: string,
  benefit?: string;
  isHighlighted?: boolean,
  onSelect: () => void,
  isLoading?: boolean,
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground transition-all hover:shadow-lg relative flex flex-col",
        isHighlighted ? "border-primary ring-2 ring-primary/50" : "hover:border-muted-foreground/30"
      )}
    >
      {isHighlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          MAIS VANTAJOSO
        </Badge>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center flex-grow">
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold tracking-tighter">{price}</span>
          <span className="text-lg text-muted-foreground">/{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        {benefit && (
          <p className="text-sm font-semibold text-primary mt-1">{benefit}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button className="w-full" variant={isHighlighted ? "default" : "outline"} disabled={isLoading} onClick={onSelect}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Assinar Agora"}
        </Button>
      </CardFooter>
    </div>
  );
};

const planDetails = {
    mensal: { price: 62.90 },
    trimestral: { price: 149.90 },
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

  const createPreference = async (plan: Plan) => {
    trackFbqEvent('InitiateCheckout', {
        content_name: plan,
        currency: 'BRL',
        value: planDetails[plan].price,
    });

    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para iniciar um pagamento.' });
        return;
    }
    setIsLoading(true);
    setSelectedPlan(plan);
    try {
        const isDevelopment = process.env.NODE_ENV === 'development';
        // Use a test user email in development to ensure test cards work for guest checkouts
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
        setIsLoading(false); // Stop loading on error
    }
  };

  // Se o usuário NUNCA começou um teste, mostramos APENAS o card de trial
  if (!profile?.trialStarted) {
      return (
        <Card className="border-primary bg-primary/5 shadow-xl max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary fill-current" />
                </div>
                <CardTitle className="font-headline text-3xl text-primary">Tudo Pronto!</CardTitle>
                <CardDescription className="text-base">
                    Você está a um passo de organizar seu ateliê. Comece agora com seu acesso gratuito por 7 dias.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <Button
                    size="lg"
                    className="w-full text-lg py-8 shadow-lg hover:scale-105 transition-transform"
                    onClick={handleStartTrial}
                    disabled={isTrialLoading}
                >
                    {isTrialLoading ? <Loader2 className="animate-spin" /> : (
                        <>
                            <Star className="mr-2 h-5 w-5 fill-current" />
                            Começar Meus 7 Dias Grátis
                        </>
                    )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    Sem compromisso. Explore todos os recursos liberados.
                </p>
            </CardContent>
        </Card>
      );
  }

  // Se o usuário JÁ começou o teste (ou ele expirou), mostramos os planos
  return (
    <Card>
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Assine o AtelierFlow</CardTitle>
            <CardDescription>
                Seu período de teste terminou ou você decidiu profissionalizar seu negócio. Escolha o melhor plano:
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <div className="md:order-2">
                    <PlanCard 
                        title="Plano Anual"
                        price="R$490"
                        period="ano"
                        subtitle="ou 12x de R$49,86"
                        benefit="Melhor custo-benefício"
                        isHighlighted
                        onSelect={() => createPreference('anual')}
                        isLoading={isLoading && selectedPlan === 'anual'}
                    />
                </div>
                    <div className="md:order-3">
                    <PlanCard 
                        title="Plano Trimestral"
                        price="R$149,90"
                        period="trimestre"
                        subtitle="ou 3x de R$55,58"
                        onSelect={() => createPreference('trimestral')}
                        isLoading={isLoading && selectedPlan === 'trimestral'}
                    />
                </div>
                <div className="md:order-1">
                        <PlanCard 
                        title="Plano Mensal"
                        price="R$62,90"
                        period="mês"
                        subtitle="Ideal para começar."
                        onSelect={() => createPreference('mensal')}
                        isLoading={isLoading && selectedPlan === 'mensal'}
                    />
                </div>
            </div>
            <p className="text-center text-sm text-muted-foreground !mt-6">
                Todos os planos incluem acesso completo ao sistema.
            </p>
        </CardContent>
    </Card>
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
          <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-5 left-5 hidden sm:block">
          <Logo className="h-8 w-8 text-primary" />
        </div>
        <div className="w-full max-w-4xl space-y-6">
            
            {!profile?.phone ? (
                <div className="max-w-md mx-auto w-full">
                    <PhoneCollectionStep user={user} />
                </div>
            ) : (
                <Tabs defaultValue="plan" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="plan">
                            {!profile.trialStarted ? "Ativar Teste" : "Assinatura"}
                        </TabsTrigger>
                        <TabsTrigger value="code">Usar Código</TabsTrigger>
                    </TabsList>
                    <TabsContent value="plan" className="mt-4">
                        <PlanSelectionTab profile={profile} />
                    </TabsContent>
                    <TabsContent value="code" className="mt-4">
                    <div className="max-w-md mx-auto">
                        <CodeActivationTab />
                    </div>
                    </TabsContent>
                </Tabs>
            )}

            <div className="w-full text-center max-w-md mx-auto">
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Dúvidas? Fale conosco no WhatsApp.
                </p>
                <Button variant="outline" className="w-full" onClick={handleWhatsAppClick}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Falar com Suporte
                </Button>
            </div>
            <div className="text-center">
                 <Button
                    variant="link"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => auth.signOut()}
                    >
                    <LogOut className="mr-2 h-4 w-4" />
                    Trocar de conta (Sair)
                </Button>
            </div>
        </div>
    </div>
  );
}
