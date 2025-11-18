
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function AjudaPage() {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { db, auth } = useFirebase();
  const user = auth.currentUser;

  const handleSendSuggestion = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Usuário não autenticado',
            description: 'Por favor, faça login para enviar uma sugestão.',
        });
        return;
    }

    if (suggestion.trim().length < 10) {
        toast({
            variant: 'destructive',
            title: 'Sugestão muito curta',
            description: 'Por favor, descreva sua ideia com um pouco mais de detalhe.',
        });
        return;
    }

    setIsLoading(true);
    try {
        const suggestionsCollection = collection(db, 'suggestions');
        await addDoc(suggestionsCollection, {
            text: suggestion,
            userId: user.uid,
            userName: user.displayName,
            userEmail: user.email,
            createdAt: serverTimestamp(),
        });

        toast({
            title: 'Obrigado pela sua sugestão!',
            description: 'Sua ideia foi enviada para nossa equipe. Agradecemos por ajudar a melhorar o AtelierFlow.',
        });
        setSuggestion('');
    } catch (error) {
        console.error("Error sending suggestion:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Enviar',
            description: 'Não foi possível enviar sua sugestão. Tente novamente mais tarde.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Central de Ajuda
        </h2>
      </div>
      <p className="text-muted-foreground">
        Tutoriais, dicas e um espaço para você nos ajudar a construir o melhor sistema para o seu ateliê.
      </p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Content: Videos */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Como "Instalar" o App no iPhone (iOS)</CardTitle>
                    <CardDescription>Aprenda a adicionar o AtelierFlow à tela de início do seu iPhone para uma experiência de app nativo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <video 
                            src="https://mgvwmiwtvzxacw2r.public.blob.vercel-storage.com/AtelierFlowTutorial.mp4" 
                            controls 
                            className="w-full h-full object-cover"
                        >
                            Seu navegador não suporta a tag de vídeo.
                        </video>
                    </div>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">Em breve: tutorial para Android e outros vídeos sobre as funcionalidades do sistema.</p>
                </CardFooter>
            </Card>

             {/* Placeholder for more videos */}
             <div className="space-y-4">
                <h3 className="text-xl font-bold font-headline">Mais Vídeos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="flex flex-col items-center justify-center p-6 bg-muted/50 text-center">
                        <CardTitle className="text-lg font-semibold">Tutorial Android</CardTitle>
                        <CardDescription className="mt-2">Em breve...</CardDescription>
                    </Card>
                     <Card className="flex flex-col items-center justify-center p-6 bg-muted/50 text-center">
                        <CardTitle className="text-lg font-semibold">Dominando o Dashboard</CardTitle>
                        <CardDescription className="mt-2">Em breve...</CardDescription>
                    </Card>
                </div>
            </div>
        </div>

        {/* Sidebar: Suggestion Box */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-xl">Tem uma Ideia?</CardTitle>
              </div>
              <CardDescription>
                Peça um novo tutorial ou sugira uma funcionalidade que você gostaria de ver no AtelierFlow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  placeholder="Ex: Gostaria de um tutorial sobre como editar um pedido ou uma funcionalidade para controlar estoque de tecidos..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="min-h-[150px]"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendSuggestion} className="w-full" disabled={isLoading}>
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
