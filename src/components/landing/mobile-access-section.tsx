'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Logo from '../icons/logo';
import { Sparkles, Wifi, Signal, BatteryFull, ArrowRight, Smartphone } from 'lucide-react';
import { useRef } from 'react';

export function MobileAccessSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <div ref={containerRef} className="py-24 sm:py-40 relative overflow-hidden bg-background">
      {/* Background elements for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-[20%] -right-20 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"
        />
        <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                x: [0, -40, 0],
                opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-[10%] -left-20 w-[600px] h-[600px] bg-secondary/20 blur-[150px] rounded-full"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
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
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Adicione o AtelierFlow à tela inicial do seu celular e tenha a experiência de um aplicativo nativo. Acesse pedidos e clientes no balcão com a velocidade que sua arte exige.
            </p>

            <div className="grid gap-6">
                <div className="flex items-start gap-4 group">
                    <div className="bg-primary/10 p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">PWA Performance</h4>
                        <p className="text-sm text-muted-foreground">Funciona em iOS e Android sem precisar baixar nada pela loja.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 group">
                    <div className="bg-secondary/10 p-3 rounded-2xl group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                        <Wifi className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Acesso Instantâneo</h4>
                        <p className="text-sm text-muted-foreground">Abra o sistema em um clique através do ícone na sua tela de início.</p>
                    </div>
                </div>
            </div>

            <motion.div
                whileHover={{ x: 10 }}
                className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs cursor-pointer group"
            >
                Saiba como instalar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </motion.div>
          </motion.div>

          {/* Visual Content: Mockup */}
          <motion.div
            style={{ y: y1, rotate }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Phone Mockup Glassmorphism */}
            <div className="relative mx-auto lg:mr-0 border-zinc-900 bg-zinc-900 border-[12px] rounded-[3.5rem] h-[640px] w-[310px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden">
                {/* Hardware details */}
                <div className="h-[46px] w-[3px] bg-zinc-800 absolute -left-[15px] top-[124px] rounded-l-lg" />
                <div className="h-[46px] w-[3px] bg-zinc-800 absolute -left-[15px] top-[178px] rounded-l-lg" />
                <div className="h-[64px] w-[3px] bg-zinc-800 absolute -right-[15px] top-[142px] rounded-r-lg" />
                
                {/* Screen Content */}
                <div className="rounded-[2.8rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                    {/* Status Bar */}
                    <div className="h-12 w-full flex justify-between items-center px-8 relative z-20">
                        <span className="text-[10px] font-bold">9:41</span>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
                        <div className="flex gap-1.5">
                            <Signal size={10} />
                            <Wifi size={10} />
                            <BatteryFull size={12} />
                        </div>
                    </div>

                    {/* App Interface Mockup */}
                    <div className="flex-1 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-6">
                            <Logo className="h-6 w-6 text-primary" />
                            <span className="font-headline font-bold text-sm">AtelierFlow</span>
                        </div>
                        
                        <div className="h-24 w-full bg-primary/10 rounded-2xl p-4 border border-primary/20">
                            <div className="h-2 w-20 bg-primary/30 rounded-full mb-2" />
                            <div className="h-4 w-32 bg-primary rounded-full" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 bg-muted/50 rounded-2xl border" />
                            <div className="h-20 bg-muted/50 rounded-2xl border" />
                        </div>

                        <div className="space-y-3 pt-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 w-full bg-muted/30 rounded-xl flex items-center px-3 gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-muted" />
                                    <div className="h-2 flex-1 bg-muted rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="h-1 w-24 bg-zinc-300 rounded-full mx-auto mb-2" />
                </div>

                {/* Reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />
            </div>

            {/* Decorative Floating Elements */}
            <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl hidden md:block"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        AF
                    </div>
                    <div className="space-y-1">
                        <div className="h-2 w-16 bg-white/40 rounded-full" />
                        <div className="h-2 w-10 bg-white/20 rounded-full" />
                    </div>
                </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
