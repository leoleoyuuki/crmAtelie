'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
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
    delay: 0,
  },
  {
    icon: Users,
    label: 'Clientes Ativos',
    value: '248',
    color: 'text-primary',
    bg: 'bg-primary/10',
    position: '-bottom-4 -left-4 md:-bottom-6 md:-left-8',
    delay: 0.8,
  },
  {
    icon: Package,
    label: 'Pedidos Hoje',
    value: '12',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    position: 'top-1/3 -right-6 md:-right-10',
    delay: 1.6,
  },
];

export function ParallaxMockup() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 100,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 100,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full perspective-[1200px]"
    >
      {/* Main 3D tilting mockup */}
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative w-full transform-gpu will-change-transform"
      >
        {/* Glow behind mockup */}
        <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-3xl opacity-60" />

        <Safari
          src="/images/dashboard5.png"
          className="relative shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] rounded-2xl"
        />
      </motion.div>

      {/* Floating metric cards */}
      {floatingCards.map((card, index) => (
        <motion.div
          key={card.label}
          className={cn(
            'absolute z-20 hidden md:flex items-center gap-3',
            'bg-card/90 backdrop-blur-xl px-4 py-3 rounded-2xl',
            'border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
            card.position
          )}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -6, 0],
          }}
          transition={{
            opacity: { delay: 0.8 + card.delay, duration: 0.5 },
            scale: { delay: 0.8 + card.delay, type: 'spring', stiffness: 100, damping: 15 },
            y: {
              delay: 1.5 + card.delay,
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            },
          }}
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
        </motion.div>
      ))}
    </div>
  );
}
