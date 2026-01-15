'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { useFirebase } from '@/firebase';
import { MessageSquare, LogOut, Loader2, Star, Gem, Crown, Key } from 'lucide-react';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { useUser } from '@/firebase/auth/use-user';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { redeemActivationToken } from '@/lib/activation';

type Plan = 'mensal' | 'trimestral' | 'anual';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '', { locale: 'pt-BR' });


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
             <p className="text-xs text-muted-foreground">
                Se você ainda não tem um código, entre em contato com o administrador do sistema.
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


function PlanSelectionTab() {
  const { user } = useUser();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPreference = async (plan: Plan) => {
    if (!user) {
        alert('Você precisa estar logado para iniciar um pagamento.');
        return;
    }
    setIsLoading(true);
    setSelectedPlan(plan);
    try {
        const response = await fetch('/api/mercadopago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plan: plan, userId: user.uid }),
        });
        const data = await response.json();
        if (response.ok) {
            setPreferenceId(data.id);
        } else {
            throw new Error(data.error || 'Erro ao criar preferência');
        }
    } catch (error) {
        console.error(error);
        alert('Não foi possível iniciar o pagamento. Tente novamente.');
        setSelectedPlan(null);
    } finally {
        setIsLoading(false);
    }
  };

  return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Escolha seu Plano</CardTitle>
          <CardDescription>
            Ative sua conta e tenha acesso a todos os recursos do AtelierFlow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-start p-4" onClick={() => createPreference('mensal')} disabled={isLoading && selectedPlan !== 'mensal'}>
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500"/>
                        <span className="font-bold text-lg">Plano Mensal</span>
                    </div>
                    <span className="text-sm font-normal">R$ 29,90 / mês</span>
                    {isLoading && selectedPlan === 'mensal' && <Loader2 className="animate-spin ml-auto"/>}
                </Button>
                 <Button variant="outline" className="h-20 flex flex-col items-start p-4" onClick={() => createPreference('trimestral')} disabled={isLoading && selectedPlan !== 'trimestral'}>
                    <div className="flex items-center gap-2">
                        <Gem className="h-5 w-5 text-blue-500"/>
                        <span className="font-bold text-lg">Plano Trimestral</span>
                    </div>
                    <span className="text-sm font-normal">R$ 79,90 / 3 meses</span>
                    {isLoading && selectedPlan === 'trimestral' && <Loader2 className="animate-spin ml-auto"/>}
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-start p-4" onClick={() => createPreference('anual')} disabled={isLoading && selectedPlan !== 'anual'}>
                     <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-500"/>
                        <span className="font-bold text-lg">Plano Anual</span>
                    </div>
                    <span className="text-sm font-normal">R$ 299,90 / ano</span>
                     {isLoading && selectedPlan === 'anual' && <Loader2 className="animate-spin ml-auto"/>}
                </Button>
            </div>
            
            {preferenceId && (
                <div className="mt-4">
                    <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option'}}} />
                </div>
            )}
        </CardContent>
    </Card>
  )
}

export default function AtivacaoPage() {
  const { auth } = useFirebase();

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phoneNumber = "5511921494313";
    const message = "Olá! Gostaria de tirar uma dúvida sobre a assinatura do sistema AtelierFlow.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-5 left-5">
          <Logo className="h-8 w-8 text-primary" />
        </div>
        <div className="w-full max-w-md space-y-6">
            <Tabs defaultValue="plan" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="plan">Pagar Assinatura</TabsTrigger>
                    <TabsTrigger value="code">Usar Código</TabsTrigger>
                </TabsList>
                <TabsContent value="plan" className="mt-4">
                    <PlanSelectionTab />
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                    <CodeActivationTab />
                </TabsContent>
            </Tabs>

            <div className="w-full text-center">
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground mb-2">Dúvidas ou problemas?</p>
                <Button variant="outline" className="w-full" onClick={handleWhatsAppClick}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Falar no WhatsApp
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
