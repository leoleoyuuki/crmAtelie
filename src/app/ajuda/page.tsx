'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send, PlayCircle, Instagram, MessageSquare, Smartphone, Laptop } from 'lucide-react';
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
    <div className="flex-1 space-y-8 px-4 pt-6 md:px-8 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Central de Ajuda
        </h2>
        <p className="text-muted-foreground">
            Aprenda a usar o sistema e leve seu ateliê para o próximo nível.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Links / Common tasks */}
        <div className="lg:col-span-4 space-y-6">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Acesso Rápido (Celular)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Para acessar o AtelierFlow como se fosse um aplicativo nativo:
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/20 p-1 rounded font-bold text-xs text-primary shrink-0">iOS</div>
                            <p className="text-xs text-muted-foreground">No Safari, clique no ícone de <strong>Compartilhar</strong> e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-secondary/20 p-1 rounded font-bold text-xs text-secondary shrink-0 font-body">AND</div>
                            <p className="text-xs text-muted-foreground">No Chrome, clique nos <strong>três pontinhos</strong> e selecione <strong>Instalar Aplicativo</strong>.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <Laptop className="h-5 w-5 text-primary" />
                        Acesso no Computador
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Para imprimir comprovantes, recomendamos o uso pelo computador através do site: <br/>
                        <code className="bg-muted p-1 rounded text-xs font-mono select-all">atelierflow.com.br</code>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-xl">Sugestões</CardTitle>
                </div>
                </CardHeader>
                <CardContent className="space-y-4">
                <div>
                    <Label className="font-semibold">O que podemos melhorar?</Label>
                    <Textarea
                    placeholder="Ex: Gostaria de uma forma de gerar relatórios em PDF..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="min-h-[100px] mt-2"
                    disabled={isLoading}
                    />
                    <Button onClick={handleSendSuggestion} className="w-full mt-2" disabled={isLoading}>
                        <Send className="mr-2 h-4 w-4" />
                        {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
                    </Button>
                </div>
                <Separator />
                <div className="flex flex-col gap-2 pt-2">
                    <Button variant="outline" onClick={handleWhatsAppClick} className="justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Suporte no WhatsApp
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                        <a href="https://www.instagram.com/atelierflow.app" target="_blank" rel="noopener noreferrer">
                            <Instagram className="mr-2 h-4 w-4" />
                            Siga no Instagram
                        </a>
                    </Button>
                </div>
                </CardContent>
            </Card>
        </div>

        {/* Tutorials */}
        <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-2">
                <PlayCircle className="h-6 w-6 text-primary" />
                Tutoriais em Vídeo
            </h3>
            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border px-4 shadow-sm">
              {tutorials.map((tutorial, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-b last:border-0">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left py-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <PlayCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-bold text-base">{tutorial.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start py-4">
                        <div className="md:col-span-1">
                            <div className="aspect-[9/16] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-muted">
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
                        <div className="md:col-span-2 space-y-4">
                            <p className="text-muted-foreground text-sm leading-relaxed">{tutorial.description}</p>
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Dica Pro</p>
                                <p className="text-xs text-muted-foreground italic">Assista até o final para não perder os atalhos de cada tela.</p>
                            </div>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </div>
      </div>
    </div>
  );
}
