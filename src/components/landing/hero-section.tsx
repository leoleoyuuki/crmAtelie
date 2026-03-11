'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { trackFbqEvent } from '@/lib/fpixel';
import { Safari } from '@/components/ui/safari';

export function HeroSection() {
    const handleLeadClick = () => {
        trackFbqEvent('Lead');
    };

  return (
    <div className="relative min-h-[90vh] flex items-center pt-20 pb-32">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 inline-block"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-2 text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] shadow-sm">
              <Sparkles className="h-3 w-3" />
              Sistema Exclusivo para Artesãos
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold font-headline tracking-tight text-foreground leading-[1.1] mb-8"
          >
            Organize pedidos, prazos e <br className="hidden md:block" />
            <span className="text-primary italic">pagamentos em um só lugar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed font-medium"
          >
            O braço direito do seu talento. Gerencie seu ateliê com a elegância, agilidade e organização que você sempre sonhou.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
                size="lg"
                asChild
                className="w-full sm:w-auto px-8 rounded-2xl shadow-xl font-bold group"
                onClick={handleLeadClick}
            >
                <a href="/login" className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current" />
                    Testar 7 dias grátis
                </a>
            </Button>
            
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto px-8 border border-primary/10 rounded-2xl font-bold"
            >
              <a href="#recursos">Conhecer Recursos</a>
            </Button>
          </motion.div>

           {/* Dashboard Preview Section */}
           <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative mt-20 px-4 sm:px-0"
          >
            {/* Desktop Mockup (Safari) */}
            <div className="hidden md:block max-w-5xl mx-auto">
                <Safari 
                  src="/images/dashboard5.png" 
                  className="shadow-2xl"
                />
                
                {/* Floating Element - Simplified */}
                <div className="absolute -bottom-6 -right-6 bg-card px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border z-20">
                    <div className="bg-green-500/20 p-1.5 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter leading-none">Status</span>
                        <span className="text-xs font-bold leading-tight">Pedido Concluído</span>
                    </div>
                </div>
            </div>

            {/* Mobile Mockup (iPhone) - Simplified */}
            <div className="md:hidden flex justify-center py-10 relative">
                <div className="relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[500px] w-[250px] shadow-2xl ring-1 ring-white/20 overflow-hidden">
                    <div className="rounded-[2.2rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}