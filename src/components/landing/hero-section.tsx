'use client';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackFbqEvent } from '@/lib/fpixel';
import { cn } from '@/lib/utils';

const images = [
    { src: "/images/dashboard1.png", alt: "Dashboard principal" },
    { src: "/images/print1.png", alt: "Tarefas" },
    { src: "/images/costs1.png", alt: "Controle de custos" }
];

export function HeroSection() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLeadClick = () => {
        trackFbqEvent('Lead');
    };

    const titleText = "Organize pedidos, prazos e pagamentos em um só lugar";
    const words = titleText.split(" ");

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center pt-20 pb-32">
      {/* Background Blobs - Optimized */}
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
                size="lg"
                asChild
                className="w-full sm:w-auto h-14 px-8 rounded-2xl shadow-xl hover:shadow-primary/20 transition-all font-bold group"
                onClick={handleLeadClick}
            >
                <a href="/login" className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-current" />
                    Testar 7 dias grátis
                </a>
            </Button>
            
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto h-14 px-8 border border-white/10 hover:border-primary/20 backdrop-blur-md rounded-2xl font-bold"
            >
              <a href="#recursos">Conhecer Recursos</a>
            </Button>
          </motion.div>

           <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="relative mt-16 px-4 sm:px-0 transform-gpu"
          >
             <div className="relative aspect-[16/9] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-muted/20 backdrop-blur-sm">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[index].src}
                            alt={images[index].alt}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Overlays - Simplified */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold">Pedido Concluído</span>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}