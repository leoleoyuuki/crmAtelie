'use client';

import { Safari } from '@/components/ui/safari';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Package } from 'lucide-react';

const floatingCards = [
  {
    icon: TrendingUp,
    label: 'Faturamento',
    value: '+32%',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    position: '-top-4 -right-4 md:-top-6 md:-right-8',
    animDelay: '0s',
  },
  {
    icon: Users,
    label: 'Clientes Ativos',
    value: '248',
    color: 'text-primary',
    bg: 'bg-primary/10',
    position: '-bottom-4 -left-4 md:-bottom-6 md:-left-8',
    animDelay: '1s',
  },
  {
    icon: Package,
    label: 'Pedidos Hoje',
    value: '12',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    position: 'top-1/3 -right-6 md:-right-10',
    animDelay: '2s',
  },
];

export function ParallaxMockup() {
  return (
    <div className="relative w-full">
      {/* Glow behind mockup */}
      <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-3xl opacity-60" />

      <Safari
        src="/images/dashboard5.png"
        className="relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] rounded-2xl"
      />

      {/* Floating metric cards — CSS animation only */}
      {floatingCards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'absolute z-20 hidden md:flex items-center gap-3',
            'bg-white/95 dark:bg-zinc-900/90 px-4 py-3 rounded-2xl',
            'border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            card.position
          )}
        >
          <div className={cn('p-2 rounded-xl', card.bg)}>
            <card.icon className={cn('h-4 w-4', card.color)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground leading-none">
              {card.label}
            </span>
            <span className={cn('text-sm font-bold leading-tight', card.color)}>
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
