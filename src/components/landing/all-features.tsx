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
    title: 'Gestão de Pedidos',
    description: 'Crie e acompanhe pedidos complexos com múltiplos serviços, prazos e prioridades em um clique.',
    className: 'md:col-span-2',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Financeiro',
    description: 'Gráficos de faturamento e custos reais para sua saúde financeira.',
    className: 'md:col-span-1',
  },
  {
    icon: ListChecks,
    title: 'Painel de Tarefas',
    description: 'Agenda inteligente que organiza seu dia automaticamente.',
    className: 'md:col-span-1',
  },
  {
    icon: Users,
    title: 'CRM de Clientes',
    description: 'Histórico completo e comunicação via WhatsApp integrada para fidelizar quem compra de você.',
    className: 'md:col-span-2',
  },
  {
    icon: Printer,
    title: 'Comprovantes Profissionais',
    description: 'Gere tickets térmicos de 58mm ou envie cópias digitais impecáveis via WhatsApp.',
    className: 'md:col-span-2',
  },
  {
    icon: Eye,
    title: 'Modo Privacidade',
    description: 'Esconda valores sensíveis para usar o sistema na frente de clientes.',
    className: 'md:col-span-1',
  },
];

export function AllFeatures() {
  return (
    <div className="bg-muted/30 py-24 sm:py-32 relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -5 }}
              className={cn("flex", feature.className)}
            >
              <Card className="flex-1 bg-white/40 dark:bg-black/40 backdrop-blur-sm border-white/20 shadow-xl rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-colors">
                <CardHeader className="p-8 pb-4">
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <CardTitle className="text-2xl font-headline mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-base leading-relaxed">
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
