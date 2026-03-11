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
    image: 'https://images.unsplash.com/photo-1618410325698-018bb3eb2318?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'lucro',
    icon: TrendingUp,
    title: 'Lucro Real',
    description: 'O dashboard financeiro mostra seu faturamento e custos de forma clara, ajudando você a crescer com segurança.',
    image: 'https://images.unsplash.com/photo-1625461291092-13d0c45608b3?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'gestao',
    icon: Clock,
    title: 'Gestão Unificada',
    description: 'Substitua cadernos e anotações soltas por um sistema que integra pedidos, clientes, preços e finanças.',
    image: 'https://plus.unsplash.com/premium_photo-1706189731991-39c4e4697d05?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
];

export function FeatureHighlights() {
  const [activeItem, setActiveItem] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div className="py-20 sm:py-32 relative overflow-hidden bg-background">
      {/* Background visual elements - Simplified for performance */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.15)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12 md:mb-20 max-w-3xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
                <Sparkles className="h-3 w-3" />
                Excelência Operacional
            </motion.div>
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
        </div>

        {/* Expandable Carousel - Optimized with transform-gpu */}
        <div className="flex flex-col md:flex-row h-[550px] md:h-[450px] w-full gap-3 md:gap-4 transform-gpu will-change-transform">
          {highlights.map((item, index) => {
            const isActive = index === activeItem;
            return (
              <motion.div
                key={item.id}
                onMouseEnter={() => {
                    setActiveItem(index);
                    setIsHovering(true);
                }}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setActiveItem(index)}
                className={cn(
                  "relative cursor-pointer overflow-hidden rounded-[2rem] transition-all duration-500 ease-in-out border border-white/10 shadow-xl transform-gpu",
                  isActive ? "flex-[4]" : "flex-[1] grayscale opacity-50 hover:opacity-70"
                )}
                layout
              >
                {/* Background Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    "object-cover transition-transform duration-700 transform-gpu",
                    isActive ? "scale-100" : "scale-110"
                  )}
                  priority={index === 0}
                />
                
                {/* Overlay Gradient */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-40"
                )} />

                {/* Content */}
                <div className={cn(
                    "absolute inset-0 p-6 md:p-8 flex flex-col justify-end transition-all duration-500 transform-gpu",
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
                )}>
                    <AnimatePresence mode="wait">
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-3"
                            >
                                <div className={cn("p-2.5 rounded-xl w-fit shadow-lg", item.bgColor, item.color)}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold font-headline text-white leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-white/80 text-xs md:text-base max-w-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Vertical Label for Inactive Items (Desktop Only) */}
                {!isActive && (
                    <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
                        <span className="rotate-90 whitespace-nowrap text-white font-black uppercase tracking-widest text-[10px] opacity-40">
                            {item.title}
                        </span>
                    </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
