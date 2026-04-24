'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackFbqEvent } from '@/lib/fpixel';
import { MagneticButton } from './magnetic-button';
import { ParallaxMockup } from './parallax-mockup';
import { KineticMarquee } from './kinetic-marquee';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

const trustPoints = [
  'Cartão ou Pix (via revendedor)',
  '7 dias grátis',
  'Cancele quando quiser',
];

const marqueeItems = [
  'Gestão Inteligente',
  'Controle de Pedidos',
  'Dashboard Financeiro',
  'Prazos Automatizados',
  'Cadastro de Clientes',
  'Precificação Precisa',
  'Estoque em Tempo Real',
  'Relatórios Detalhados',
];

export function HeroSection() {
  const isMobile = useIsMobile();

  const handleLeadClick = () => {
    trackFbqEvent('Lead');
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
      {/* Main Hero Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 pb-16 lg:pt-0 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center min-h-[calc(100dvh-6rem)]">

          {/* LEFT: Content */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            {/* Eyebrow Badge */}
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] border border-primary/[0.12] px-4 py-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Sistema Exclusivo para Artesãos
            </span>

            {/* Headline */}
            <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline tracking-tight text-foreground leading-[1.05]">
              Organize pedidos,<br />
              prazos e<br />
              <span className="text-primary italic">pagamentos em um<br />só lugar</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[52ch] font-medium">
              O braço direito do seu talento. Gerencie seu ateliê com a
              elegância, agilidade e organização que você sempre sonhou.
            </p>

            {/* CTA Group */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <MagneticButton href="/login" onClick={handleLeadClick}>
                Testar 7 dias grátis
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>

              <Button
                size="lg"
                variant="ghost"
                asChild
                className="px-6 border border-primary/10 rounded-2xl font-bold hover:bg-primary/5 transition-colors"
              >
                <a href="#recursos">Conhecer Recursos</a>
              </Button>
            </div>

            {/* Trust Points */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Responsive Mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {isMobile ? (
              <div className="flex justify-center relative">
                <div className="relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[480px] w-[235px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/20 overflow-hidden">
                  <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-3xl z-50" />
                    <div className="flex-1 relative">
                      <Image
                        src="/images/dashboard3.png"
                        alt="AtelierFlow Dashboard Mobile"
                        fill
                        className="object-cover object-top"
                        priority
                      />
                    </div>
                    <div className="h-1 w-24 bg-foreground/10 rounded-full mx-auto mb-2" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/15 blur-[80px] -z-10 rounded-full" />
              </div>
            ) : (
              <div className="w-full">
                <ParallaxMockup />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kinetic Marquee Band */}
      <div className="relative z-10 border-t border-b border-primary/5 py-5 bg-white/5 dark:bg-zinc-900/50">
        <KineticMarquee items={marqueeItems} speed={50} />
      </div>
    </section>
  );
}