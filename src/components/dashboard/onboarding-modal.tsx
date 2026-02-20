
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Smartphone, 
  Printer, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import Link from 'next/link';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('atelierflow_onboarding_seen');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('atelierflow_onboarding_seen', 'true');
    setIsOpen(false);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "5511921494313";
    const message = "Olá! Acabei de entrar no AtelierFlow e gostaria de tirar uma dúvida.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-background shadow-2xl">
        <div className="bg-primary p-8 text-primary-foreground relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <Logo className="h-32 w-32 fill-current" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-3xl font-headline font-bold">Bem-vinda ao AtelierFlow!</h2>
                    <p className="text-primary-foreground/80 font-medium italic">"Menos papelada, mais arte."</p>
                </div>
            </div>
        </div>

        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <Printer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Use no Computador e Celular</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Acesse pelo PC para imprimir comprovantes térmicos e pelo celular para gerenciar pedidos no balcão.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Comunicação Inteligente</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Envie confirmações de pedido e avisos de "Pronto para Retirada" via WhatsApp com apenas um clique.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Instale como um Aplicativo</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            No celular, clique em "Compartilhar" e "Adicionar à Tela de Início" para ter o ícone do AtelierFlow junto com seus apps.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-muted-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Precisa de ajuda agora?</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleWhatsAppClick} className="h-8 text-xs font-bold border-primary text-primary hover:bg-primary/5">
                        Chamar Suporte
                    </Button>
                    <Button asChild variant="link" size="sm" className="h-8 text-xs text-muted-foreground">
                        <Link href="/ajuda">Ver Tutoriais</Link>
                    </Button>
                </div>
            </div>
        </div>

        <DialogFooter className="p-6 pt-0">
            <Button onClick={handleClose} className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">
                Começar a Organizar meu Ateliê
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
