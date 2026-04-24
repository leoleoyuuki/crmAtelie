'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

export function TypingText({
  text,
  className,
  delay = 0,
  speed = 0.02,
}: TypingTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVisible(true), delay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <span ref={ref} className={cn('inline-block', className)} aria-label={text}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transition: `opacity 0.08s ease`,
            transitionDelay: visible ? `${index * speed}s` : '0s',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
