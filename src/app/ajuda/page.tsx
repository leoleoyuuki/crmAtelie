'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send, PlayCircle, Instagram, MessageSquare } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';


// Estrutura de dados para os tutoriais
const tutorials = [
  {
    title: 'Visão Geral do Sistema',
    description: 'Um tour rápido pelas principais funcionalidades do AtelierFlow.',
    embedUrl: 'https://www.youtube.com/embed/VgI4RJox96Q',
  },
  {
    title: 'Instalando o App no iPhone',
    description: 'Aprenda a adicionar o AtelierFlow à tela de início do seu celular (iPhone).',
    embedUrl: 'https://www.youtube.com/embed/naJ2vvul9CQ',
  },
  {
    title: 'Instalando o App no Android',
    description: 'Aprenda a adicionar o AtelierFlow à tela de início do seu celular (Android).',
    embedUrl: 'https://www.youtube.com/embed/RMVnjdAQwjc',
  },
  {
    title: 'Cadastrando um Cliente',
    description: 'Veja como é fácil e rápido adicionar um novo cliente no sistema.',
    embedUrl: 'https://www.youtube.com/embed/Eu4QhFOacng',
  },
  {
    title: 'Criando seu Primeiro Pedido',
    description: 'Guia completo para registrar um pedido, adicionar itens e definir prazos.',
    embedUrl: 'https://www.youtube.com/embed/mZZTcv9yDIs',
  },
  {
    title: 'Editando e Atualizando Pedidos',
    description: 'Aprenda a modificar um pedido existente e alterar seu status no fluxo de trabalho.',
    embedUrl: 'https://www.youtube.com/embed/fnd5sCOXVos',
  },
  {
    title: 'Concluindo um Pedido',
    description: 'Aprenda a finalizar um pedido, dar baixa no estoque e atualizar seus relatórios financeiros.',
    embedUrl: 'https://www.youtube.com/embed/5mQFgeuiSaU',
  },
  {
    title: 'Usando o Painel de Tarefas',
    description: 'Descubra como o painel de tarefas organiza seu dia para você nunca mais perder um prazo.',
    embedUrl: 'https://www.youtube.com/embed/SbKFY28grnc',
  },
  {
    title: 'Entendendo seu Financeiro',
    description: 'Uma análise do seu dashboard para você entender de onde vem e para onde vai seu dinheiro.',
    embedUrl: 'https://www.youtube.com/embed/nZzQp_Md860',
  },
  {
    title: 'Controle de Custos e Compras',
    description: 'Veja como registrar compras de materiais e custos fixos para um financeiro preciso.',
    embedUrl: 'https://www.youtube.com/embed/kKNjJWs0a2U',
  },
  {
    title: 'Tabela de Preços',
    description: 'Cadastre seus serviços e agilize a criação de novos pedidos com preços padronizados.',
    embedUrl: 'https://www.youtube.com/embed/3vAevdW8Ob0',
  },
];


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

    const suggestionsCollection = collection(db, 'suggestions');
    const suggestionData = {
        text: suggestion,
        userId: user.uid,
        userName: user.displayName || 'Anônimo',
        userEmail: user.email,
        createdAt: serverTimestamp(),
    };

    addDoc(suggestionsCollection, suggestionData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: suggestionsCollection.path,
          operation: 'create',
          requestResourceData: suggestionData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    }).then(() => {
        toast({
            title: 'Obrigado pela sua sugestão!',
            description: 'Sua ideia foi enviada para nossa equipe. Agradecemos por ajudar a melhorar o AtelierFlow.',
        });
        setSuggestion('');
    }).finally(() => {
        setIsLoading(false);
    });
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phoneNumber = "5511921494313";
    const message = "Olá! Gostaria de tirar uma dúvida sobre o sistema AtelierFlow.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8">
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
            <Accordion type="single" collapsible className="w-full">
              {tutorials.map((tutorial, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3 text-left">
                      <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-headline text-lg">{tutorial.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start p-4">
                        <div className="md:col-span-1">
                            <div className="aspect-[9/16] w-full max-w-[260px] mx-auto rounded-xl overflow-hidden shadow-lg border">
                                <iframe
                                    src={tutorial.embedUrl}
                                    title={tutorial.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground text-sm">{tutorial.description}</p>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </div>

        {/* Sidebar: Suggestion Box */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-xl">Suporte e Sugestões</CardTitle>
              </div>
              <CardDescription>
                Precisa de ajuda ou tem uma ideia? Use os canais abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Deixe uma sugestão</Label>
                <Textarea
                  placeholder="Ex: Gostaria de um tutorial sobre..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="min-h-[120px] mt-2"
                  disabled={isLoading}
                />
                <Button onClick={handleSendSuggestion} className="w-full mt-2" disabled={isLoading}>
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
                </Button>
              </div>
              <Separator />
              <div>
                  <p className="text-sm font-medium mb-2">Fale conosco</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={handleWhatsAppClick}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Falar no WhatsApp
                    </Button>
                     <Button variant="outline" asChild>
                        <a href="https://www.instagram.com/atelierflow.app" target="_blank" rel="noopener noreferrer">
                            <Instagram className="mr-2 h-4 w-4" />
                            Mensagem no Instagram
                        </a>
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
