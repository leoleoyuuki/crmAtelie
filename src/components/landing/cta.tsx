'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { trackFbqEvent } from '@/lib/fpixel';
import { Star, Sparkles } from 'lucide-react';

export function Cta() {
  const handleLeadClick = () => {
    trackFbqEvent('Lead');
  };

  return (
    <div className="py-24 sm:py-32 relative overflow-hidden bg-primary/5">
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto p-10 md:p-16 rounded-[3rem] bg-card border shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Oferta Especial
          </div>
          <h2 className="text-3xl font-bold font-headline tracking-tighter text-foreground sm:text-5xl mb-6">
            Tudo pronto para <br/>
            <span className="text-primary italic">organizar seu ateliê?</span>
          </h2>
          <p className="mx-auto text-lg text-muted-foreground mb-10 max-w-xl font-medium">
            Junte-se a centenas de artesãos que transformaram a gestão de seus negócios com o AtelierFlow.
          </p>
          
          <Button size="lg" asChild onClick={handleLeadClick} className="px-12 py-8 text-xl rounded-2xl shadow-xl font-bold hover:scale-105 transition-transform">
            <Link href="/login">
              <Star className="mr-2 h-6 w-6 fill-current" />
              Começar agora grátis
            </Link>
          </Button>
          
          <p className="mt-8 text-sm text-muted-foreground font-bold uppercase tracking-wider opacity-60">
            Sem cartão de crédito • Cancelamento fácil • Suporte VIP
          </p>
        </motion.div>
      </div>
    </div>
  );
}