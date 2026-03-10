
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
    color: 'from-orange-500/20 to-orange-500/5',
  },
  {
    icon: BarChart3,
    title: 'Finanças',
    titleFull: 'Financeiro',
    description: 'Gráficos de faturamento e custos reais para sua saúde financeira.',
    className: 'col-span-1 md:col-span-1',
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: ListChecks,
    title: 'Tarefas',
    titleFull: 'Tarefas',
    description: 'Agenda inteligente que organiza seu dia automaticamente.',
    className: 'col-span-1 md:col-span-1',
    color: 'from-green-500/20 to-green-500/5',
  },
  {
    icon: Users,
    title: 'Clientes',
    titleFull: 'CRM de Clientes',
    description: 'Histórico completo e comunicação via WhatsApp integrada para fidelizar quem compra.',
    className: 'col-span-2 md:col-span-2',
    color: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: Printer,
    title: 'Comprovantes',
    titleFull: 'Comprovantes',
    description: 'Gere tickets térmicos de 58mm ou envie cópias digitais impecáveis via WhatsApp.',
    className: 'col-span-2 md:col-span-2',
    color: 'from-primary/20 to-primary/5',
  },
  {
    icon: Eye,
    title: 'Privacidade',
    titleFull: 'Privacidade',
    description: 'Esconda valores sensíveis para usar o sistema com segurança na frente de clientes.',
    className: 'col-span-2 md:col-span-1',
    color: 'from-secondary/20 to-secondary/5',
  },
];

export function AllFeatures() {
  return (
    <div className="bg-muted/30 py-24 sm:py-32 relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <motion.div 
            animate={{ 
                x: [0, 100, 0],
                y: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div 
            animate={{ 
                x: [0, -100, 0],
                y: [0, -50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"
        />
      </div>

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-fr text-left">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleFull}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={cn("flex group", feature.className)}
            >
              <Card className="flex-1 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl rounded-[2rem] md:rounded-[3rem] overflow-hidden relative transition-all duration-500 hover:border-primary/30">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <feature.icon className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                </div>

                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-100 transition-opacity duration-700 -z-10",
                    feature.color
                )} />
                
                <CardHeader className="p-5 md:p-10 pb-2 md:pb-4 relative z-10">
                  <div className="bg-primary/10 p-3 md:p-5 rounded-[1.25rem] w-fit text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-sm">
                    <feature.icon className="h-5 w-5 md:h-7 md:w-7" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-5 md:p-10 pt-2 md:pt-4 relative z-10">
                  <CardTitle className="text-lg md:text-3xl font-headline font-bold mb-2 md:mb-6 group-hover:text-primary transition-colors leading-tight">
                    <span className="md:hidden">{feature.title}</span>
                    <span className="hidden md:inline">{feature.titleFull}</span>
                  </CardTitle>
                  <p className="text-muted-foreground text-[10px] md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none opacity-80 group-hover:opacity-100 transition-opacity">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Bottom Highlight Line */}
                <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-primary group-hover:w-full transition-all duration-700 ease-in-out" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
