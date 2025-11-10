'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    },
  },
};

const badgeVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    },
  },
};

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-24 sm:py-32 lg:py-40 text-center relative"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Badge */}
          <motion.div 
            variants={badgeVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Exclusivo: Sistema para Ateliês</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold font-headline tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl leading-tight"
          >
            A gestão do seu <span className="text-primary">ateliê</span>, elevada a <span className="text-primary">outro nível</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-3xl text-xl text-muted-foreground md:text-2xl leading-relaxed"
          >
            Chega de comandas de papel e planilhas confusas. Com o{' '}
            <span className="font-semibold text-foreground bg-primary/10 px-2 py-1 rounded">AtelierFlow</span>,
            você organiza pedidos, controla finanças e ganha tempo para focar
            no que realmente importa: sua arte.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" asChild className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <a href="/login">
                Comece agora
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/5 transition-all">
              <a href="#recursos">
                Ver recursos
              </a>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm"
          >
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Contato direto com Criador</span>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-border" />
            
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Adaptação fácil e ágil</span>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-border" />
            
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <span className="font-medium">Baseado em processos reais</span>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xs font-bold text-primary"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2.847</span> artesãos já usam
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
