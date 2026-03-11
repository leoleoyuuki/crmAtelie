'use client';
import { motion } from 'framer-motion';
import Logo from '../icons/logo';
import { Sparkles, Wifi, Signal, BatteryFull, ArrowRight, Smartphone } from 'lucide-react';

export function MobileAccessSection() {
  return (
    <div className="py-24 sm:py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" />
              Mobilidade Total
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight leading-[1.1]">
                Seu ateliê no bolso, <br/>
                <span className="text-primary italic">sempre com você.</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Adicione o AtelierFlow à tela inicial do seu celular e tenha a experiência de um aplicativo nativo. Acesse pedidos e clientes com rapidez.
            </p>

            <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Instalação Simples</h4>
                        <p className="text-xs text-muted-foreground">Funciona em iOS e Android sem baixar pela loja.</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] cursor-pointer group">
                Saiba como instalar
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end transform-gpu"
          >
            {/* Optimized Phone Mockup */}
            <div className="relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[580px] w-[280px] shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                    <div className="h-10 w-full flex justify-between items-center px-6">
                        <span className="text-[10px] font-bold">9:41</span>
                        <div className="flex gap-1">
                            <Signal size={8} />
                            <Wifi size={8} />
                            <BatteryFull size={10} />
                        </div>
                    </div>

                    <div className="flex-1 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Logo className="h-5 w-5 text-primary" />
                            <span className="font-headline font-bold text-xs">AtelierFlow</span>
                        </div>
                        <div className="h-20 w-full bg-primary/10 rounded-xl border border-primary/20" />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-16 bg-muted/50 rounded-xl border" />
                            <div className="h-16 bg-muted/50 rounded-xl border" />
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}