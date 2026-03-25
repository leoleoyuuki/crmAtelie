'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  onClick,
  href,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative inline-flex items-center justify-center gap-2.5 cursor-pointer',
        'px-8 py-4 rounded-2xl font-bold text-base',
        'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
        'shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]',
        'hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.6)]',
        'transition-shadow duration-300',
        'active:scale-[0.97]',
        className
      )}
      onClick={onClick}
    >
      {/* Inner glow border — "Liquid Glass" refraction */}
      <div className="absolute inset-0 rounded-2xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </motion.div>
  );

  if (href) {
    return <a href={href}>{inner}</a>;
  }

  return inner;
}
