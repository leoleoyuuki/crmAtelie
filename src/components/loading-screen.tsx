'use client';

import React, { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Passando a linha na agulha...",
    "Alinhando os tecidos...",
    "Costurando os detalhes...",
    "Passando o ferro nos detalhes...",
    "Abrindo as portas do seu atelier..."
  ];

  useEffect(() => {
    // Dynamic progress bar simulator (asymptotically approaches 95%)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const remaining = 95 - prev;
        const increment = Math.max(1, Math.floor(remaining * 0.1));
        return prev + increment;
      });
    }, 250);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Cycles messages based on progress
    if (progress < 20) setMessageIndex(0);
    else if (progress < 45) setMessageIndex(1);
    else if (progress < 70) setMessageIndex(2);
    else if (progress < 90) setMessageIndex(3);
    else setMessageIndex(4);
  }, [progress]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background overflow-hidden px-6">
      {/* Textile noise pattern overlay */}
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay" />
      
      {/* Embedded CSS for custom needle and spiral thread animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw-thread {
          0% { stroke-dashoffset: 283; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -283; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes needle-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.15; transform: scale(0.95); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        .animate-draw-thread {
          stroke-dasharray: 283;
          animation: draw-thread 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-needle-bob {
          animation: needle-bob 0.4s ease-in-out infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
      `}} />

      {/* Main Container Card (Glassmorphism inspired) */}
      <div className="glass-card z-10 flex flex-col items-center max-w-md w-full rounded-3xl p-10 text-center shadow-xl border border-white/40">
        
        {/* Brand Name / Subtitle */}
        <span className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-1">
          Carregando
        </span>
        <h1 className="font-headline text-3xl font-bold text-primary mb-8 tracking-wide">
          AtelierFlow
        </h1>

        {/* Central Spiral & Glowing Base */}
        <div className="relative flex items-center justify-center w-36 h-36 mb-8">
          {/* Radial soft background glow */}
          <div className="absolute w-32 h-32 rounded-full bg-primary/20 blur-2xl animate-glow-pulse pointer-events-none" />
          
          {/* SVG Spiral Thread */}
          <svg viewBox="0 0 100 100" className="w-28 h-28 text-primary animate-spin-slow">
            <path
              d="M 50 50 A 2.5 2.5 0 0 1 50 45 A 5 5 0 0 1 50 55 A 7.5 7.5 0 0 1 50 40 A 10 10 0 0 1 50 60 A 12.5 12.5 0 0 1 50 35 A 15 15 0 0 1 50 65 A 17.5 17.5 0 0 1 50 30 A 20 20 0 0 1 50 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-draw-thread"
            />
          </svg>
        </div>

        {/* Sewing progress bar */}
        <div className="relative w-full h-12 flex items-center mt-2">
          {/* Base seam path (gray/beige dashed) */}
          <div className="absolute left-0 right-0 h-[2px] border-t border-dashed border-muted-foreground/30" />
          
          {/* Sewn seam progress path (primary Rust color dashed) */}
          <div 
            className="absolute left-0 h-[2px] border-t-2 border-dashed border-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          
          {/* The Needle that sews the path */}
          <div 
            className="absolute top-1/2 transition-all duration-300 ease-out flex flex-col items-center pointer-events-none"
            style={{ 
              left: `${progress}%`,
              transform: 'translate(-50%, -85%)',
            }}
          >
            <div className="animate-needle-bob">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-12 text-zinc-400">
                {/* Thread trailing loop through needle eye */}
                <path 
                  d="M 12 5 C 16 0, 18 8, 12 8 C 8 8, 6 12, 12 14" 
                  stroke="hsl(19, 52%, 48%)" 
                  strokeWidth="1.25" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                {/* Metallic Needle Body */}
                <path d="M 11.5 2 L 12.5 2 L 12.5 22 L 12 23.5 L 11.5 22 Z" fill="currentColor" />
                {/* Needle Eye Hole (matches the Light Sand background color inside the glass card) */}
                <ellipse cx="12" cy="5" rx="0.5" ry="1.5" fill="hsla(47, 22%, 98%, 0.96)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading details */}
        <div className="w-full flex justify-between items-center text-xs text-muted-foreground mt-1 mb-6 px-1">
          <span className="font-body italic animate-pulse transition-all duration-300">
            {messages[messageIndex]}
          </span>
          <span className="font-mono font-medium text-primary">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
