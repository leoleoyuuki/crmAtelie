
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Logo from '@/components/icons/logo';
import { useFirebase } from '@/firebase';
import { activateAccount } from '@/lib/activation';
import { MessageSquare, LogOut } from 'lucide-react';


export default function AtivacaoPage() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { auth, db } = useFirebase();

  const handleActivation = async () => {
    if (!token.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, insira um código de ativação.',
      });
      return;
    }
    
    if (!auth.currentUser) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Usuário não autenticado. Faça login novamente.',
        });
        return;
    }

    setIsLoading(true);
    try {
      await activateAccount(db, auth.currentUser, token);
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

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phoneNumber = "5511957211546";
    const message = "Olá! Gostaria de adquirir um código de ativação para o sistema AtelierFlow.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-5 left-5">
          <Logo className="h-8 w-8 text-primary" />
        </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Ativação de Conta</CardTitle>
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleActivation} disabled={isLoading} className="w-full">
                {isLoading ? 'Ativando...' : 'Ativar Conta'}
            </Button>
            
             <div className="w-full text-center">
                <p className="text-xs text-muted-foreground mb-2">Não tem um código?</p>
                <Button variant="outline" className="w-full" onClick={handleWhatsAppClick}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Adquirir Código via WhatsApp
                </Button>
            </div>

            <Button
                variant="link"
                size="sm"
                className="text-muted-foreground"
                onClick={() => auth.signOut()}
                >
                <LogOut className="mr-2 h-4 w-4" />
                Trocar de conta (Sair)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
