'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const highlights = [
  {
    id: 'prazos',
    icon: ShieldCheck,
    title: 'Prazos Sob Controle',
    description: 'Centralize todas as ordens de serviço em um painel inteligente que prioriza automaticamente o que é urgente.',
    image: 'https://picsum.photos/seed/prazos/800/600',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'lucro',
    icon: TrendingUp,
    title: 'Lucro Real',
    description: 'O dashboard financeiro mostra seu faturamento e custos de forma clara, ajudando você a crescer com segurança.',
    image: 'https://picsum.photos/seed/lucro/800/600',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'gestao',
    icon: Clock,
    title: 'Gestão Unificada',
    description: 'Substitua cadernos e anotações soltas por um sistema que integra pedidos, clientes, preços e finanças.',
    image: 'https://picsum.photos/seed/gestao/800/600',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
];

export function FeatureHighlights() {
  const [activeItem, setActiveItem] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % highlights.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-20 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Sparkles className="h-3 w-3" />
                Excelência Operacional
            </div>
            <h2 className="text-4xl font-bold font-headline tracking-tight sm:text-6xl text-foreground leading-[1.1]">
                Menos papelada, <br/>
                <span className="text-primary italic">mais arte.</span>
            </h2>
        </div>

        <div className="flex flex-col md:flex-row h-[500px] md:h-[450px] w-full gap-4">
          {highlights.map((item, index) => {
            const isActive = index === activeItem;
            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(index)}
                className={cn(
                  "relative cursor-pointer overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-in-out border border-primary/5 shadow-xl",
                  isActive ? "flex-[4]" : "flex-[1] opacity-60 hover:opacity-80"
                )}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    "object-cover transition-transform duration-700",
                    isActive ? "scale-100" : "scale-110 grayscale"
                  )}
                  priority={index === 0}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className={cn(
                    "absolute inset-0 p-6 md:p-10 flex flex-col justify-end transition-all duration-500",
                    isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                )}>
                    {isActive && (
                        <div className="space-y-3">
                            <div className={cn("p-2.5 rounded-xl w-fit shadow-lg", item.bgColor, item.color)}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-2xl md:text-4xl font-bold font-headline text-white leading-tight">
                                {item.title}
                            </h3>
                            <p className="text-white/80 text-sm md:text-lg max-w-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    )}
                </div>

                {!isActive && (
                    <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
                        <span className="rotate-90 whitespace-nowrap text-white font-black uppercase tracking-widest text-xs opacity-60">
                            {item.title}
                        </span>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}