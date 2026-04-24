'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function MagneticButton({
  children,
  className,
  onClick,
  href,
}: MagneticButtonProps) {
  const inner = (
    <span
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-2.5 cursor-pointer select-none',
        'px-8 py-4 rounded-2xl font-bold text-base',
        'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
        'shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]',
        'hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.6)]',
        'hover:-translate-y-0.5 active:scale-[0.97]',
        'transition-all duration-200',
        className
      )}
    >
      {/* Inner glow border */}
      <span className="absolute inset-0 rounded-2xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </span>
  );

  if (href) {
    return <a href={href}>{inner}</a>;
  }

  return inner;
}
