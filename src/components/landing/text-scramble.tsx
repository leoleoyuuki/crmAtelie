'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

export function TextScramble({
  text,
  className,
  delay = 0,
  speed = 30,
  as: Tag = 'span',
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);

  const scramble = useCallback(() => {
    let iteration = 0;
    const totalIterations = text.length;

    const interval = setInterval(() => {
      const resolved = text.slice(0, iteration);
      const scrambled = text
        .slice(iteration)
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      setDisplayText(resolved + scrambled);
      iteration += 1;

      if (iteration > totalIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) {
      // Show scrambled placeholder
      setDisplayText(
        text
          .split('')
          .map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join('')
      );
      return;
    }
    return scramble();
  }, [started, scramble, text]);

  return (
    <Tag className={cn('inline-block', className)}>
      {displayText}
    </Tag>
  );
}
