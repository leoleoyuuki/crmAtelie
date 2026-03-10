'use client';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Headset, Clock, Users, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { trackFbqEvent } from '@/lib/fpixel';

const benefits = [
  { icon: Headset, text: 'Suporte dedicado' },
  { icon: Clock, text: 'Adaptação fácil' },
  { icon: Users, text: 'Processos reais' },
];

const images = [
    { src: "/images/dashboard.png", alt: "Dashboard principal" },
    { src: "/images/print.png", alt: "Impressão de comprovante" },
    { src: "/images/costs.png", alt: "Controle de custos" }
];

export function HeroSection() {
    const [index, setIndex] = useState(0);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleLeadClick = () => {
        trackFbqEvent('Lead');
    };

    const titleLetters = "Organize pedidos, prazos e pagamentos em um só lugar".split("");

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Elementos 3D Interativos (Simulação WebGL com CSS/Motion) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -60, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px]"
        />
      </div>

      <motion.div style={{ y, opacity }} className="container mx-auto px-4 md:px-6 py-20 text-center relative">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary border border-primary/20 backdrop-blur-md">
              <motion.span 
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mr-2 h-2 w-2 rounded-full bg-primary"
              />
              SISTEMA EXCLUSIVO PARA ATELIÊS
            </span>
          </motion.div>

          {/* Tipografia Cinética */}
          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.1] mb-8">
            {titleLetters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, type: "spring", stiffness: 100 }}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            O braço direito do seu talento. Gerencie seu ateliê com a elegância e organização que ele merece.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                size="lg"
                asChild
                className="w-full sm:w-auto text-lg px-10 py-7 shadow-2xl shadow-primary/30 transition-all font-bold"
                onClick={handleLeadClick}
                >
                <a href="/login">
                    <Star className="mr-2 h-5 w-5 fill-current" />
                    Testar 7 dias grátis
                </a>
                </Button>
            </motion.div>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto text-lg px-10 py-7 hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 backdrop-blur-sm"
            >
              <a href="#recursos">Ver recursos</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16"
          >
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              {benefits.map((benefit, i) => (
                <motion.div 
                    key={benefit.text} 
                    className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm"
                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <benefit.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

           <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, type: "spring", damping: 20 }}
            className="relative mt-20 px-4 sm:px-0 group"
          >
             <div className="relative aspect-[16/10] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/20">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-40" />
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1 }}
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
            </div>
            {/* Efeito de Reflexo Glassmorphism */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 backdrop-blur-3xl rounded-full -z-10"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
