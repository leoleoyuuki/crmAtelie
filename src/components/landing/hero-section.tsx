'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
      ease: [0.22, 1, 0.36, 1]
    },
  },
};

export function HeroSection() {
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
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl md:text-6xl leading-tight"
          >
            Organize pedidos, prazos e pagamentos do seu ateliê em um só lugar
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Sistema feito exclusivamente para ateliês de costura, bordado e personalizados. Substitui planilhas, cadernos e anotações soltas.
          </motion.p>

          <motion.div 
            variants={itemVariants} 
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" asChild className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <a href="/login">
                Organizar meu ateliê agora
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/5 transition-all">
              <a href="#recursos">
                Conhecer os benefícios
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative mt-16 px-4 sm:px-0"
          >
            <Image
                src="/print.png"
                alt="Captura de tela do sistema AtelierFlow mostrando a organização de pedidos"
                width={1200}
                height={785}
                className="rounded-lg shadow-2xl ring-1 ring-black/10"
                priority
            />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
