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

const features = [
  {
    icon: StickyNote,
    title: 'Gestão de Pedidos',
    description: 'Crie e acompanhe pedidos complexos com múltiplos serviços e prazos em um clique.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Financeiro',
    description: 'Gráficos de faturamento e custos para você entender a saúde do seu negócio.',
  },
  {
    icon: ListChecks,
    title: 'Painel de Tarefas',
    description: 'Agenda inteligente que decompõe pedidos em tarefas diárias priorizadas.',
  },
  {
    icon: Users,
    title: 'CRM de Clientes',
    description: 'Histórico completo e comunicação via WhatsApp integrada para fidelização.',
  },
  {
    icon: Printer,
    title: 'Comprovantes 58mm',
    description: 'Gere tickets térmicos profissionais e envie cópias digitais para seus clientes.',
  },
  {
    icon: Eye,
    title: 'Modo Privacidade',
    description: 'Esconda valores sensíveis com senha para usar o sistema na frente de clientes.',
  },
];

export function AllFeatures() {
  return (
    <div className="bg-muted/30 py-24 sm:py-32 relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl font-bold font-headline tracking-tight sm:text-5xl"
          >
            Ferramentas profissionais para <br className="hidden md:block" />
            <span className="text-primary">artesãos modernos</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-sm border-white/20 shadow-2xl rounded-[2rem] overflow-hidden group">
                <CardHeader className="p-8">
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <CardTitle className="text-xl font-headline mb-3">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
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
