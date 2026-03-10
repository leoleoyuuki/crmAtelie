'use client';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Headset, Clock, Users, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { trackFbqEvent } from '@/lib/fpixel';
import { cn } from '@/lib/utils';

const benefits = [
  { icon: Headset, text: 'Suporte dedicado', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Clock, text: 'Adaptação fácil', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Users, text: 'Processos reais', color: 'text-green-500', bg: 'bg-green-500/10' },
];

const images = [
    { src: "/images/dashboard1.png", alt: "Dashboard principal" },
    { src: "/images/print1.png", alt: "Tarefas" },
    { src: "/images/costs1.png", alt: "Controle de custos" }
];

export function HeroSection() {
    const [index, setIndex] = useState(0);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Ajuste na opacidade: Mantém 100% até 40% do scroll, depois desvanece
    const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacity = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [1, 1, 0, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

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
    <div ref={containerRef} className="relative overflow-hidden min-h-screen flex items-center pt-20 pb-32">
      {/* Background Cinético & Blobs */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] left-[5%] w-[40%] h-[40%] bg-primary/15 rounded-full blur-[120px] opacity-60"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[5%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[150px] opacity-50"
        />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>

      <motion.div style={{ y, opacity, scale }} className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-block"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/20 px-4 py-2 text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Sistema Exclusivo para Artesãos
            </span>
          </motion.div>

          {/* Tipografia Cinética */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold font-headline tracking-tight text-foreground leading-[1.05] mb-8">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05), type: "spring", stiffness: 100, damping: 12 }}
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
            transition={{ delay: 0.8, duration: 1 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed font-medium"
          >
            O braço direito do seu talento. Gerencie seu ateliê com a elegância, agilidade e organização que você sempre sonhou.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    size="lg"
                    asChild
                    className="w-full sm:w-auto text-lg px-12 py-8 rounded-2xl shadow-[0_20px_50px_-15px_rgba(var(--primary-rgb),0.4)] transition-all font-bold group"
                    onClick={handleLeadClick}
                >
                    <a href="/login" className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-current transition-transform group-hover:rotate-12" />
                        Testar 7 dias grátis
                    </a>
                </Button>
            </motion.div>
            
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto text-lg px-10 py-8 hover:bg-primary/5 transition-all border border-white/10 hover:border-primary/20 backdrop-blur-xl rounded-2xl font-bold"
            >
              <a href="#recursos">Conhecer Recursos</a>
            </Button>
          </motion.div>

          {/* Widgets de Benefícios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-20"
          >
            
          </motion.div>

           {/* Preview do Sistema (Mockup Tridimensional) */}
           <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, type: "spring", damping: 25, stiffness: 80 }}
            className="relative mt-24 px-4 sm:px-0"
          >
             <div className="relative aspect-[16/9] max-w-6xl mx-auto group">
                {/* Frame do Navegador / App */}
                <div className="absolute inset-0 bg-white/5 border border-white/20 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden">
                    {/* Browser Toolbar UI */}
                    <div className="h-10 border-b border-white/10 flex items-center px-6 gap-2 bg-white/5">
                        <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                        </div>
                        <div className="flex-1 max-w-sm mx-auto h-5 bg-white/5 rounded-md border border-white/5 flex items-center px-3">
                            <div className="h-1.5 w-32 bg-white/10 rounded-full" />
                        </div>
                    </div>

                    <div className="relative w-full h-full">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={images[index].src}
                                    alt={images[index].alt}
                                    fill
                                    className="object-cover"
                                    priority
                                    data-ai-hint="atelier dashboard"
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Badges Flutuantes de Destaque */}
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -right-6 sm:right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl z-20 hidden sm:flex items-center gap-3"
                >
                    <div className="bg-green-500/20 p-2 rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Status</p>
                        <p className="text-sm font-bold leading-none">Pedido Concluído</p>
                    </div>
                </motion.div>

                <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 -left-6 sm:left-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl z-20 hidden sm:flex items-center gap-3"
                >
                    <div className="bg-primary/20 p-2 rounded-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Produtividade</p>
                        <p className="text-sm font-bold leading-none">+45% Eficiência</p>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
