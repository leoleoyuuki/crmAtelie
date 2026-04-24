'use client';
import {
  BarChart3,
  Eye,
  ListChecks,
  Printer,
  StickyNote,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: StickyNote,
    title: 'Pedidos',
    titleFull: 'Gestão de Pedidos',
    description: 'Crie e acompanhe pedidos complexos com múltiplos serviços, prazos e prioridades em um clique.',
    className: 'col-span-2 md:col-span-2',
    color: 'from-orange-500/10 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Finanças',
    titleFull: 'Financeiro',
    description: 'Gráficos de faturamento e custos reais para sua saúde financeira.',
    className: 'col-span-1 md:col-span-1',
    color: 'from-blue-500/10 to-transparent',
  },
  {
    icon: ListChecks,
    title: 'Tarefas',
    titleFull: 'Tarefas',
    description: 'Agenda inteligente que organiza seu dia automaticamente.',
    className: 'col-span-1 md:col-span-1',
    color: 'from-green-500/10 to-transparent',
  },
  {
    icon: Users,
    title: 'Clientes',
    titleFull: 'CRM de Clientes',
    description: 'Histórico completo e comunicação via WhatsApp integrada para fidelizar quem compra.',
    className: 'col-span-2 md:col-span-2',
    color: 'from-purple-500/10 to-transparent',
  },
  {
    icon: Printer,
    title: 'Comprovantes',
    titleFull: 'Comprovantes',
    description: 'Gere tickets térmicos de 58mm ou envie cópias digitais impecáveis via WhatsApp.',
    className: 'col-span-2 md:col-span-2',
    color: 'from-primary/10 to-transparent',
  },
  {
    icon: Eye,
    title: 'Privacidade',
    titleFull: 'Privacidade',
    description: 'Esconda valores sensíveis para usar o sistema com segurança na frente de clientes.',
    className: 'col-span-2 md:col-span-1',
    color: 'from-secondary/10 to-transparent',
  },
];

export function AllFeatures() {
  return (
    <div className="py-24 sm:py-32 relative overflow-hidden bg-muted/20">
      {/* Crepe Paper Texture Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] dark:opacity-[0.08]"
        style={{
          backgroundImage: 'url(/images/crepe-paper-muted.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
        }}
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-5xl mb-4">
              Ferramentas profissionais para <br className="hidden md:block" />
              <span className="text-primary italic">artesãos modernos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo o que você precisa para sair do amadorismo e escalar sua produção com organização.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
          {features.map((feature) => (
            <div
              key={feature.titleFull}
              className={cn('flex', feature.className)}
            >
              <Card className="flex-1 bg-white/95 dark:bg-zinc-900/90 border-primary/10 shadow-lg rounded-[2rem] overflow-hidden relative">
                <CardHeader className="p-5 md:p-8 pb-2 relative z-10">
                  <div className="bg-primary/10 p-3 md:p-4 rounded-2xl w-fit text-primary shadow-sm">
                    <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </CardHeader>

                <CardContent className="p-5 md:p-8 pt-2 relative z-10 text-left">
                  <CardTitle className="text-lg md:text-2xl font-headline font-bold mb-2 md:mb-4 leading-tight">
                    <span className="md:hidden">{feature.title}</span>
                    <span className="hidden md:inline">{feature.titleFull}</span>
                  </CardTitle>
                  <p className="text-muted-foreground text-xs md:text-base leading-relaxed line-clamp-3 md:line-clamp-none opacity-80">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}