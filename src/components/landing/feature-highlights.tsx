
'use client';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

const highlights = [
  {
    id: 'prazos',
    icon: ShieldCheck,
    title: 'Prazos Sob Controle',
    description: 'Centralize todas as ordens de serviço em um painel inteligente que prioriza automaticamente o que é urgente.',
    image: placeholderData.placeholderImages.find(img => img.id === 'feature-prazos')?.url || '',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'lucro',
    icon: TrendingUp,
    title: 'Lucro Real',
    description: 'O dashboard financeiro mostra seu faturamento e custos de forma clara, ajudando você a crescer com segurança.',
    image: placeholderData.placeholderImages.find(img => img.id === 'feature-lucro')?.url || '',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'gestao',
    icon: Clock,
    title: 'Gestão Unificada',
    description: 'Substitua cadernos e anotações soltas por um sistema que integra pedidos, clientes, preços e finanças.',
    image: placeholderData.placeholderImages.find(img => img.id === 'feature-gestao')?.url || '',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
];

export function FeatureHighlights() {
  const containerRef = useRef(null);
  const [activeItem, setActiveItem] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgTextX = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveItem((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div ref={containerRef} className="py-24 sm:py-40 relative overflow-hidden">
      {/* Texto de Fundo Cinético */}
      <motion.div 
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 text-[15rem] font-black text-primary/5 whitespace-nowrap pointer-events-none select-none hidden lg:block"
      >
        ATELIER FLOW ATELIER FLOW
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6"
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

        {/* Expandable Carousel */}
        <div className="flex flex-col md:flex-row h-[600px] md:h-[500px] w-full gap-3 md:gap-4">
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
                  "relative cursor-pointer overflow-hidden rounded-[2.5rem] transition-all duration-700 ease-in-out border border-white/20 shadow-2xl",
                  isActive ? "flex-[3] md:flex-[4]" : "flex-[1] grayscale opacity-60 hover:opacity-80"
                )}
              >
                {/* Background Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-1000",
                    isActive ? "scale-105" : "scale-110 blur-[2px]"
                  )}
                />
                
                {/* Overlay Gradient */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700",
                    isActive ? "opacity-100" : "opacity-40"
                )} />

                {/* Content */}
                <div className={cn(
                    "absolute inset-0 p-6 md:p-10 flex flex-col justify-end transition-all duration-700",
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none md:pointer-events-auto"
                )}>
                    <AnimatePresence mode="wait">
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div className={cn("p-3 rounded-2xl w-fit shadow-lg", item.bgColor, item.color)}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl md:text-4xl font-bold font-headline text-white leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-white/80 text-sm md:text-lg max-w-md leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Vertical Label for Inactive Items (Desktop Only) */}
                {!isActive && (
                    <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
                        <span className="rotate-90 whitespace-nowrap text-white font-black uppercase tracking-widest text-xs opacity-50">
                            {item.title}
                        </span>
                    </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Background visual elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-[10%] -left-20 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full" 
        />
        <motion.div 
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-[10%] -right-20 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full" 
        />
      </div>
    </div>
  );
}
