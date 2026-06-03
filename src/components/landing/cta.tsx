'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { trackFbqEvent } from '@/lib/fpixel';
import { Star, Sparkles } from 'lucide-react';

export function Cta() {
  const handleLeadClick = () => {
    trackFbqEvent('Lead');
  };

  return (
    <div className="py-24 sm:py-36 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Main CTA Card */}
        <div className="group relative max-w-4xl mx-auto p-8 sm:p-16 md:p-20 rounded-[3rem] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-[0_15px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden text-center sm:text-left">
          
          {/* Inner Glow Background */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-orange-400/5 rounded-full blur-[80px] pointer-events-none -z-10" />

          {/* 3D Floating Sparkles Icon */}
          <img
            src="/images/bnbIcons/Sparkles.png"
            alt="Sparkles"
            className="absolute hidden sm:block -top-10 -right-6 md:-top-14 md:-right-10 w-28 h-28 md:w-36 md:h-36 object-contain pointer-events-none select-none transition-transform duration-700 group-hover:scale-115 group-hover:rotate-12 group-hover:-translate-y-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 fill-primary/20" />
                Oferta Especial
              </div>
              
              {/* Headline */}
              <h2 className="text-3xl font-extrabold font-headline tracking-tight sm:text-4xl md:text-5xl text-zinc-900 dark:text-white leading-[1.15]">
                Pronto para organizar <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent italic">
                  seu ateliê de vez?
                </span>
              </h2>
              
              {/* Description */}
              <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg max-w-xl leading-relaxed font-light">
                Junte-se a centenas de artesãos modernos que saíram da papelada e profissionalizaram seus prazos, finanças e atendimentos com o AtelierFlow.
              </p>
              
              {/* Security info */}
              <p className="text-xs text-zinc-400 dark:text-zinc-500 tracking-wide font-medium uppercase pt-2">
                Pix ou Cartão (via revendedor) • Cancelamento instantâneo • Suporte VIP
              </p>
            </div>

            {/* Button call-to-action */}
            <div className="shrink-0 relative flex flex-col items-center gap-3">
              {/* Shadow glow under button */}
              <div className="absolute inset-0 bg-primary/25 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90" />
              
              <Button
                size="lg"
                asChild
                onClick={handleLeadClick}
                className="relative px-10 py-7 text-lg rounded-2xl font-bold bg-primary hover:bg-primary/95 text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                <Link href="/login">
                  <Star className="mr-2 h-5 w-5 fill-current" />
                  Começar agora grátis
                </Link>
              </Button>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">Experimente grátis por 7 dias</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}