'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

export function Cta() {
  return (
    <div className="py-20 sm:py-28">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold font-headline tracking-tighter text-primary sm:text-4xl">
            Escolha o plano ideal para organizar seu ateliê.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Comece com um plano flexível e tenha acesso a todas as ferramentas para profissionalizar seu negócio e ganhar mais tempo para criar.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/login">Organizar meu ateliê agora</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
