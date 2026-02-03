'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { trackFbqEvent } from '@/lib/fpixel';
import { Star } from 'lucide-react';

export function Cta() {
  const handleLeadClick = () => {
    trackFbqEvent('Lead');
  };

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
            Tudo pronto para organizar seu ateliê?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Aproveite todos os recursos sem custo pelos próximos 7 dias. Comece agora e transforme sua produtividade.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild onClick={handleLeadClick} className="px-10 py-7 text-lg">
              <Link href="/login">
                <Star className="mr-2 h-5 w-5 fill-current" />
                Começar meu teste grátis
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
