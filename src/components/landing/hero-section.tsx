'use client';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Headset, Clock, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const benefits = [
  {
    icon: Headset,
    text: 'Suporte dedicado',
  },
  {
    icon: Clock,
    text: 'Adaptação fácil e ágil',
  },
  {
    icon: Users,
    text: 'Baseado em processos reais',
  },
];

const images = [
    { 
        src: "/images/dashboard.png", 
        alt: "Dashboard principal do AtelierFlow mostrando gráficos de faturamento e pedidos." 
    },
    { 
        src: "/images/print.png", 
        alt: "Tela de impressão de comprovante de pedido do AtelierFlow." 
    },
    { 
        src: "/images/costs.png", 
        alt: "Tela de controle de custos e compras do AtelierFlow." 
    }
];


export function HeroSection() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);


  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-20 sm:py-28 text-center relative"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#D96142]"></span>
              Exclusivo: Sistema para Ateliês
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl md:text-6xl leading-tight"
          >
            Organize{' '}
            <span className="text-primary">
              pedidos, prazos e pagamentos
            </span>{' '}
            do seu ateliê em um só lugar
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Sistema feito exclusivamente para ateliês de costura, bordado e
            personalizados. Substitui planilhas, cadernos e anotações soltas.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <a href="/login">Organizar meu ateliê agora</a>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/5 transition-all"
            >
              <a href="#recursos">Ver recursos</a>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 hidden sm:block"
          >
            <div className="sm:flex sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
              {benefits.map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-700">
                    <benefit.icon className="h-4 w-4" />
                  </div>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

           <motion.div
            variants={itemVariants}
            className="relative mt-16 px-4 sm:px-0"
          >
             <div className="relative aspect-[1200/785] max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[index].src}
                            alt={images[index].alt}
                            fill
                            className="rounded-lg shadow-2xl ring-1 ring-black/10 object-cover"
                            priority={index === 0}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
