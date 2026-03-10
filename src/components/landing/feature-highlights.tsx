'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Clock } from 'lucide-react';

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Prazos Sob Controle',
    description: 'Centralize todas as ordens de serviço em um painel inteligente que prioriza automaticamente o que é urgente.',
  },
  {
    icon: TrendingUp,
    title: 'Lucro Real',
    description: 'O dashboard financeiro mostra seu faturamento e custos de forma clara, ajudando você a crescer com segurança.',
  },
  {
    icon: Clock,
    title: 'Gestão Unificada',
    description: 'Substitua cadernos e anotações soltas por um sistema que integra pedidos, clientes, preços e finanças.',
  },
];

export function FeatureHighlights() {
  return (
    <div className="py-24 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
            <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-5xl text-foreground">
                Menos papelada, <span className="text-primary italic">mais arte.</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                O AtelierFlow elimina a burocracia para você focar no que realmente importa: a sua criação.
            </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <motion.div 
                key={highlight.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all shadow-xl"
            >
              <div className="bg-primary/20 p-4 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform">
                <highlight.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-headline mb-3 text-foreground">{highlight.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{highlight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background visual element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 blur-[150px] rounded-full" />
      </div>
    </div>
  );
}
