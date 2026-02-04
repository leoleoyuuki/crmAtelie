'use client';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export function SocialProof() {
  return (
    <div className="py-16 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <Quote className="h-10 w-10 text-primary/40 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-headline font-bold leading-tight text-foreground">
            “Criado junto com ateliês reais que precisavam de mais controle e menos planilhas.”
          </h2>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              AF
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">AtelierFlow</p>
              <p className="text-xs text-muted-foreground">Autoridade em Gestão Artesanal</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
