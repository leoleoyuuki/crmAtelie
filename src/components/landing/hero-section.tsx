'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Headset, Clock, Users } from 'lucide-react';

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

const benefits = [
    {
        icon: Headset,
        text: "Suporte dedicado"
    },
    {
        icon: Clock,
        text: "Adaptação fácil e ágil"
    },
    {
        icon: Users,
        text: "Baseado em processos reais"
    }
]

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
            Organize <span className="text-primary">pedidos, prazos e pagamentos</span> do seu ateliê em um só lugar
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Chega de comandas de papel e planilhas confusas. Com o <span className="font-bold text-foreground">AtelierFlow</span>, você organiza pedidos, controla finanças e ganha tempo para focar no que realmente importa: sua arte.
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
            <Button size="lg" variant="ghost" asChild className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/5 transition-all">
              <a href="#recursos">
                Ver recursos
              </a>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12">
            <div className="hidden sm:flex sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
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
            <Image
                src="/images/print.png"
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
