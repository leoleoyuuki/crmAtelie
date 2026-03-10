'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const highlights = [
  {
    icon: ShieldCheck,
    number: '01',
    title: 'Prazos Sob Controle',
    description: 'Centralize todas as ordens de serviço em um painel inteligente que prioriza automaticamente o que é urgente.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: TrendingUp,
    number: '02',
    title: 'Lucro Real',
    description: 'O dashboard financeiro mostra seu faturamento e custos de forma clara, ajudando você a crescer com segurança.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    offset: true, // Para o efeito assimétrico
  },
  {
    icon: Clock,
    number: '03',
    title: 'Gestão Unificada',
    description: 'Substitua cadernos e anotações soltas por um sistema que integra pedidos, clientes, preços e finanças.',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
  },
];

export function FeatureHighlights() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const bgTextX = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <div ref={containerRef} className="py-24 sm:py-40 relative overflow-hidden">
      {/* Texto de Fundo Cinético (Marca d'água) */}
      <motion.div 
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 text-[15rem] font-black text-primary/5 whitespace-nowrap pointer-events-none select-none hidden lg:block"
      >
        ATELIER FLOW ATELIER FLOW
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          style={{ y: titleY }}
          className="text-center mb-24 max-w-3xl mx-auto"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
                <Sparkles className="h-3 w-3" />
                Excelência Operacional
            </div>
            <h2 className="text-4xl font-bold font-headline tracking-tight sm:text-6xl text-foreground leading-[1.1]">
                Menos papelada, <br/>
                <span className="relative inline-block">
                    <span className="text-primary italic">mais arte.</span>
                    <motion.span 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="absolute -bottom-2 left-0 h-1 bg-primary/30 rounded-full"
                    />
                </span>
            </h2>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
                O AtelierFlow elimina a complexidade técnica para que o seu talento seja o único protagonista do dia.
            </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 items-start">
          {highlights.map((highlight, index) => (
            <motion.div 
                key={highlight.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                    delay: index * 0.2, 
                    type: "spring", 
                    stiffness: 50, 
                    damping: 20 
                }}
                className={cn(
                    "group relative p-10 rounded-[3rem] transition-all duration-500",
                    "bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl hover:shadow-primary/10",
                    highlight.offset && "md:translate-y-16"
                )}
            >
              {/* Número Kinetic em Background */}
              <span className="absolute top-6 right-8 text-7xl font-black text-foreground/5 font-code group-hover:text-primary/10 transition-colors duration-500">
                {highlight.number}
              </span>

              <div className={cn(
                  "p-4 rounded-2xl inline-block mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg",
                  highlight.bgColor,
                  highlight.color
              )}>
                <highlight.icon className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-bold font-headline mb-4 text-foreground group-hover:text-primary transition-colors">
                {highlight.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-sm lg:text-base opacity-80 group-hover:opacity-100 transition-opacity">
                {highlight.description}
              </p>

              {/* Decorative Internal Glow */}
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background visual elements - Formas Orgânicas */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-[10%] -left-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" 
        />
        <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-[10%] -right-20 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full" 
        />
      </div>
    </div>
  );
}
