'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, UserPlus, PlusCircle, PlayCircle } from 'lucide-react';
import { OrderFormDialog } from './order-form-dialog';
import { CustomerFormDialog } from './customer-form-dialog';
import Link from 'next/link';

export function WelcomeGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  useEffect(() => {
    // Only show the guide if it hasn't been dismissed before.
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
      <Card className="relative bg-primary/5 border-primary/20 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar Guia</span>
        </Button>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Seja bem-vindo(a) ao AtelierFlow!</CardTitle>
          <CardDescription>
            Tudo pronto para organizar seu ateliê. Siga estes passos simples para começar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
                 <h3 className="font-semibold">Crie um Cliente</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Adicione seu primeiro cliente para poder associá-lo a um pedido.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsCustomerFormOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
            <div className="flex flex-col items-center md:items-start p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">2</span>
                    <h3 className="font-semibold">Crie um Pedido</h3>
                </div>
              <p className="text-sm text-muted-foreground mb-3">
                Agora, registre o primeiro pedido para seu novo cliente.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsOrderFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </div>
            <div className="flex flex-col items-center md:items-start p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">3</span>
                    <h3 className="font-semibold">Explore os Tutoriais</h3>
                </div>
              <p className="text-sm text-muted-foreground mb-3">
                Assista aos vídeos na Central de Ajuda para dominar o sistema.
              </p>
               <Button asChild variant="outline" size="sm">
                  <Link href="/ajuda">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Ver Tutoriais
                  </Link>
                </Button>
            </div>
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
