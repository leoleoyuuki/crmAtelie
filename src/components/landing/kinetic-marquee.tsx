'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticMarqueeProps {
  items: string[];
  className?: string;
  separator?: string;
  speed?: number;
  reverse?: boolean;
}

export function KineticMarquee({
  items,
  className,
  separator = '\u00A0\u00A0\u2022\u00A0\u00A0',
  speed = 40,
  reverse = false,
}: KineticMarqueeProps) {
  const content = items.join(separator) + separator;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden select-none',
        className
      )}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee-left ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {/* Duplicate content for seamless loop */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="text-sm md:text-base font-black uppercase tracking-[0.25em] text-muted-foreground/30"
            aria-hidden={i > 0}
          >
            {content}
          </span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
