'use client';

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
    image: '/images/prazos.jpg',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    accent: '#f97316',
  },
  {
    id: 'lucro',
    icon: TrendingUp,
    title: 'Lucro Real',
    description: 'O dashboard financeiro mostra seu faturamento e custos de forma clara, ajudando você a crescer com segurança.',
    image: '/images/lucro.jpg',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    accent: 'hsl(var(--primary))',
  },
  {
    id: 'gestao',
    icon: Clock,
    title: 'Gestão Unificada',
    description: 'Substitua cadernos e anotações soltas por um sistema que integra pedidos, clientes, preços e finanças.',
    image: '/images/gestao.jpg',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    accent: 'hsl(var(--secondary))',
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

  const active = highlights[activeItem];

  return (
    <div className="py-20 sm:py-32">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles className="h-3 w-3" />
            Excelência Operacional
          </div>
          <h2 className="text-4xl font-bold font-headline tracking-tight sm:text-6xl text-foreground leading-[1.1]">
            Menos papelada, <br />
            <span className="text-primary italic">mais arte.</span>
          </h2>
        </div>

        {/* Showcase — images stacked, opacity crossfade only (GPU compositing) */}
        <div className="relative w-full h-[420px] sm:h-[520px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">

          {/* Image layers — only opacity changes, no layout */}
          {highlights.map((item, index) => (
            <div
              key={item.id}
              className="absolute inset-0 will-change-[opacity]"
              style={{
                opacity: index === activeItem ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
              aria-hidden={index !== activeItem}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 90vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}

          {/* Persistent gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

          {/* Content overlay — crossfades independently */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12">

            {/* Active item info — opacity crossfade */}
            <div className="mb-6">
              {highlights.map((item, index) => (
                <div
                  key={item.id}
                  className="will-change-[opacity]"
                  style={{
                    opacity: index === activeItem ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    // Stack all items in same spot
                    position: index === 0 ? 'relative' : 'absolute',
                    bottom: index === 0 ? undefined : '5rem',
                    left: index === 0 ? undefined : '1.5rem',
                    right: index === 0 ? undefined : '1.5rem',
                    pointerEvents: index !== activeItem ? 'none' : undefined,
                  }}
                >
                  <div className={cn('inline-flex p-2.5 rounded-xl mb-3 shadow-lg', item.bgColor, item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold font-headline text-white leading-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/75 text-sm md:text-base max-w-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Tab buttons */}
            <div className="flex gap-2 md:gap-3 flex-wrap">
              {highlights.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(index)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-colors duration-200',
                    index === activeItem
                      ? 'bg-white text-black border-white'
                      : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
            <div
              key={activeItem}
              className="h-full bg-white/60"
              style={{
                animation: 'progress-bar 6s linear forwards',
              }}
            />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes progress-bar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}