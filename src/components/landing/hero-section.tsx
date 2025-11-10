
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
};
  
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
        duration: 0.5,
        ease: 'easeOut'
        },
    },
};

export function HeroSection() {
    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="py-20 sm:py-28 text-center"
        >
            <div className="container mx-auto px-4 md:px-6">
                <motion.h1
                variants={itemVariants}
                className="text-4xl font-bold font-headline tracking-tighter text-primary sm:text-5xl md:text-6xl"
                >
                A gestão do seu ateliê, elevada a outro nível.
                </motion.h1>
                <motion.p
                variants={itemVariants}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
                >
                Chega de comandas de papel e planilhas confusas. Com o AtelierFlow,
                você organiza pedidos, controla finanças e ganha tempo para focar
                no que realmente importa: sua arte.
                </motion.p>
                <motion.div variants={itemVariants} className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/login">Comece a organizar seu ateliê (Grátis)</Link>
                </Button>
                </motion.div>
            </div>
      </motion.div>
    )
}
