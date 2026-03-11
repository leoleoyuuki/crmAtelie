'use client';

import {
  BarChart3,
  Eye,
  ListChecks,
  Printer,
  StickyNote,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-5xl mb-4">
              Ferramentas profissionais para <br className="hidden md:block" />
              <span className="text-primary italic">artesãos modernos</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo o que você precisa para sair do amadorismo e escalar sua produção com organização.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleFull}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={cn("flex group", feature.className)}
            >
              <Card className="flex-1 bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg rounded-[2rem] overflow-hidden relative transition-all duration-300 hover:border-primary/30">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    feature.color
                )} />
                
                <CardHeader className="p-5 md:p-8 pb-2 relative z-10">
                  <div className="bg-primary/10 p-3 md:p-4 rounded-2xl w-fit text-primary transition-all duration-300 group-hover:scale-110 shadow-sm">
                    <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-5 md:p-8 pt-2 relative z-10 text-left">
                  <CardTitle className="text-lg md:text-2xl font-headline font-bold mb-2 md:mb-4 group-hover:text-primary transition-colors leading-tight">
                    <span className="md:hidden">{feature.title}</span>
                    <span className="hidden md:inline">{feature.titleFull}</span>
                  </CardTitle>
                  <p className="text-muted-foreground text-xs md:text-base leading-relaxed line-clamp-3 md:line-clamp-none opacity-80 group-hover:opacity-100 transition-opacity">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}