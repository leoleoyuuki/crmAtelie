'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';
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
  as: Tag = 'span',
}: TypingTextProps) {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        controls.start('visible');
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, delay]);

  const container: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
      },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={controls}
      className={cn('inline-block', className)}
    >
      {text.split('').map((char, index) => (
        <motion.span key={index} variants={child}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
