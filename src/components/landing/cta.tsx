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
    <div className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <motion.div 
        animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
      />

      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Oferta Especial
          </div>
          <h2 className="text-3xl font-bold font-headline tracking-tighter text-foreground sm:text-5xl mb-6">
            Tudo pronto para <br/>
            <span className="text-primary italic">organizar seu ateliê?</span>
          </h2>
          <p className="mx-auto text-lg text-muted-foreground mb-10 max-w-xl">
            Junte-se a centenas de artesãos que transformaram a gestão de seus negócios com o AtelierFlow.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" asChild onClick={handleLeadClick} className="px-12 py-8 text-xl rounded-2xl shadow-2xl shadow-primary/40 font-bold">
              <Link href="/login">
                <Star className="mr-2 h-6 w-6 fill-current" />
                Começar agora grátis
              </Link>
            </Button>
          </motion.div>
          
          <p className="mt-6 text-sm text-muted-foreground font-medium">
            Sem cartão de crédito • Cancelamento fácil • Suporte VIP
          </p>
        </motion.div>
      </div>
    </div>
  );
}
