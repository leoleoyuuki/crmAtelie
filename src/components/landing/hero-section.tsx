'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { trackFbqEvent } from '@/lib/fpixel';
import { cn } from '@/lib/utils';
import { Safari } from '@/components/ui/safari';

export function HeroSection() {
    const handleLeadClick = () => {
        trackFbqEvent('Lead');
    };

    const titleText = "Organize pedidos, prazos e pagamentos em um só lugar";
    const words = titleText.split(" ");

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center pt-20 pb-32">
      {/* Background Visual Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-block"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/20 px-4 py-2 text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] backdrop-blur-md shadow-lg">
              <Sparkles className="h-3 w-3" />
              Sistema Exclusivo para Artesãos
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-headline tracking-tight text-foreground leading-[1.1] mb-8 transform-gpu">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.03), duration: 0.4 }}
                className={cn(
                    "inline-block mr-[0.25em]",
                    word.toLowerCase() === "organize" || word.toLowerCase() === "lugar" ? "text-primary italic" : ""
                )}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed font-medium"
          >
            O braço direito do seu talento. Gerencie seu ateliê com a elegância, agilidade e organização que você sempre sonhou.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
                size="default"
                asChild
                className="w-full sm:w-auto h-11 px-6 rounded-2xl shadow-xl hover:shadow-primary/20 transition-all font-bold group"
                onClick={handleLeadClick}
            >
                <a href="/login" className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current" />
                    Testar 7 dias grátis
                </a>
            </Button>
            
            <Button
              size="default"
              variant="ghost"
              asChild
              className="w-full sm:w-auto h-11 px-6 border border-white/10 hover:border-primary/20 backdrop-blur-md rounded-2xl font-bold"
            >
              <a href="#recursos">Conhecer Recursos</a>
            </Button>
          </motion.div>

           {/* Dashboard Preview Section */}
           <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, type: "spring" }}
            className="relative mt-20 px-4 sm:px-0 transform-gpu"
          >
            {/* Desktop Mockup (Safari) */}
            <div className="hidden md:block max-w-5xl mx-auto group">
                <Safari 
                  src="/images/dashboard1.png" 
                  className="transition-transform duration-700 hover:scale-[1.01]"
                />
                
                {/* Floating Elements for Desktop */}
                <div className="absolute -top-6 -right-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 z-20">
                    <div className="bg-green-500/20 p-1.5 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Status</span>
                        <span className="text-xs font-bold">Pedido Concluído</span>
                    </div>
                </div>
            </div>

            {/* Mobile Mockup (iPhone) */}
            <div className="md:hidden flex justify-center py-10 relative">
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[550px] w-[270px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/20 overflow-hidden"
                >
                    {/* Interface Content */}
                    <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                        {/* Dynamic Island */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-3xl z-50" />
                        
                        {/* Status Bar Space */}
                        <div className="h-8 w-full flex justify-between items-center px-8 pt-4 opacity-40">
                            <span className="text-[10px] font-black">9:41</span>
                        </div>
                        {/* Mobile Image */}
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
                <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
