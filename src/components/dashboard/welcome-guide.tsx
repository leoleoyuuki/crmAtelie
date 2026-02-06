'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, UserPlus, PlusCircle, Smartphone, CheckCircle2, Monitor } from 'lucide-react';
import { OrderFormDialog } from './order-form-dialog';
import { CustomerFormDialog } from './customer-form-dialog';
import Link from 'next/link';

export function WelcomeGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('atelierflow_welcome_guide_dismissed') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('atelierflow_welcome_guide_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Card className="relative bg-primary/5 border-primary/20 shadow-lg mb-6 overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar Guia</span>
            </Button>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-2xl text-primary">Seu Ateliê Organizado!</CardTitle>
          <CardDescription className="text-base">
            Siga estes 3 passos para dominar o sistema hoje mesmo:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {/* Step 1 */}
            <div className="bg-background/50 p-4 rounded-xl border border-primary/10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
                 <h3 className="font-bold">Crie um Cliente</h3>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                O primeiro passo é cadastrar quem confia no seu trabalho.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsCustomerFormOpen(true)} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar agora
              </Button>
            </div>

            {/* Step 2 */}
            <div className="bg-background/50 p-4 rounded-xl border border-primary/10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
                    <h3 className="font-bold">Registre um Pedido</h3>
                </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Crie o primeiro pedido para o seu cliente e veja o fluxo acontecer.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsOrderFormOpen(true)} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar pedido
              </Button>
            </div>

            {/* Step 3 */}
            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex flex-col gap-3 ring-2 ring-primary/20 animate-pulse-slow">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
                    <h3 className="font-bold">Multitela: PC e Celular</h3>
                </div>
              <p className="text-sm font-medium text-primary flex-grow">
                Use no PC para imprimir comprovantes e no celular para o dia a dia. Instale como App clicando em "Compartilhar".
              </p>
               <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/ajuda">
                    <Monitor className="mr-2 h-4 w-4" />
                    Ver Guia de Acesso
                  </Link>
                </Button>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
             <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-muted-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Entendi, já sei usar o sistema
             </Button>
          </div>
        </CardContent>
      </Card>

      <CustomerFormDialog
        isOpen={isCustomerFormOpen}
        setIsOpen={setIsCustomerFormOpen}
        onCustomerCreated={() => {}}
        onCustomerUpdated={() => {}}
      />
      <OrderFormDialog
        isOpen={isOrderFormOpen}
        setIsOpen={setIsOrderFormOpen}
        onOrderCreated={() => {}}
        onOrderUpdated={() => {}}
      />
    </>
  );
}
