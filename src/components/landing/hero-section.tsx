'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackFbqEvent } from '@/lib/fpixel';
import { MagneticButton } from './magnetic-button';
import { ParallaxMockup } from './parallax-mockup';
import { TypingText } from './typing-text';
import { KineticMarquee } from './kinetic-marquee';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

const trustPoints = [
  'Sem cartão de crédito',
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

export function HeroSection() {
  const isMobile = useIsMobile();

  const handleLeadClick = () => {
    trackFbqEvent('Lead');
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
      {/* Crumpled Paper Texture Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.07] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'url(/images/crumpled-paper-texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '600px 600px',
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />

      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/[0.04] blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/[0.03] blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-accent/[0.02] blur-[80px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Main Hero Content — Asymmetric Split */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 pb-16 lg:pt-0 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center min-h-[calc(100dvh-6rem)]">
          {/* LEFT: Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start text-left max-w-2xl"
          >
            {/* Eyebrow Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] border border-primary/[0.12] px-4 py-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Sistema Exclusivo para Artesãos
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline tracking-tight text-foreground leading-[1.05]"
            >
              <TypingText
                text="Organize pedidos,"
                className="block"
                delay={400}
                speed={0.03}
              />
              <TypingText
                text="prazos e"
                className="block"
                delay={700}
                speed={0.03}
              />
              <span className="text-primary italic block">
                <TypingText
                  text="pagamentos em um"
                  delay={1000}
                  speed={0.03}
                />
              </span>
              <span className="text-primary italic block">
                <TypingText
                  text="só lugar"
                  delay={1200}
                  speed={0.03}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[52ch] font-medium"
            >
              O braço direito do seu talento. Gerencie seu ateliê com a
              elegância, agilidade e organização que você sempre sonhou.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              <MagneticButton
                href="/login"
                onClick={handleLeadClick}
              >
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
            </motion.div>

            {/* Trust Points */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2"
            >
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                  {point}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: Responsive Mockup — Phone on mobile, Desktop on larger screens */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              {isMobile ? (
                /* Mobile: iPhone mockup with dashboard3.png */
                <motion.div
                  key="phone-mockup"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 80, damping: 20 }}
                  className="flex justify-center relative"
                >
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[480px] w-[235px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/20 overflow-hidden"
                  >
                    <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                      {/* Dynamic Island */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-3xl z-50" />
                      {/* Mobile Dashboard Image */}
                      <div className="flex-1 relative">
                        <Image
                          src="/images/dashboard3.png"
                          alt="AtelierFlow Dashboard Mobile"
                          fill
                          className="object-cover object-top"
                          priority
                        />
                      </div>
                      {/* Home Indicator */}
                      <div className="h-1 w-24 bg-foreground/10 rounded-full mx-auto mb-2" />
                    </div>
                  </motion.div>
                  {/* Glow behind phone */}
                  <div className="absolute inset-0 bg-primary/15 blur-[80px] -z-10 rounded-full" />
                </motion.div>
              ) : (
                /* Desktop: ParallaxMockup */
                <motion.div
                  key="desktop-mockup"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{
                    delay: 0.5,
                    duration: 0.8,
                    type: 'spring',
                    stiffness: 60,
                    damping: 20,
                  }}
                  className="w-full"
                >
                  <ParallaxMockup />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Kinetic Marquee Band */}
      <div className="relative z-10 border-t border-b border-primary/5 py-5 bg-card/30 backdrop-blur-sm">
        <KineticMarquee items={marqueeItems} speed={50} />
      </div>
    </section>
  );
}