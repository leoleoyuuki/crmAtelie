'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../icons/logo';
import { Sparkles, Wifi, Signal, ArrowRight, Smartphone, CheckCircle2, Laptop, Printer, Monitor, Share, Plus, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

export function MobileAccessSection() {
  const isMobile = useIsMobile();

  // Definição dos conteúdos baseados no dispositivo
  const content = {
    mobile: {
      badge: "Acesso no Computador",
      title: "Gestão Profissional no seu Computador",
      desc: "Acesse pelo PC ou Mac para ter uma visão expandida do seu ateliê. A melhor forma de gerenciar grandes volumes de pedidos e imprimir comprovantes térmicos.",
      features: [
        { icon: Printer, title: "Impressão Térmica", desc: "Configure e imprima tickets de 58mm direto do navegador." },
        { icon: Monitor, title: "Visão Expandida", desc: "Analise gráficos e relatórios financeiros com mais clareza." }
      ],
      linkText: "Veja como acessar no computador"
    },
    desktop: {
      badge: "Mobilidade Total",
      title: "Seu ateliê no bolso, sempre com você.",
      desc: "Adicione o AtelierFlow à tela inicial do seu celular e tenha a experiência de um aplicativo nativo. Gerencie pedidos e envie comprovantes direto do balcão.",
      features: [
        { icon: Smartphone, title: "Instalação Simples", desc: "Sem baixar pela loja, direto do navegador." },
        { icon: CheckCircle2, title: "Acesso Rápido", desc: "Notificações e contatos sempre à mão no atendimento." }
      ],
      linkText: "Saiba como instalar no seu celular"
    }
  };

  const currentContent = isMobile ? content.mobile : content.desktop;

  return (
    <div className="py-24 sm:py-40 relative overflow-hidden bg-background">
      {/* Elementos de Fundo Otimizados */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] transform-gpu" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] transform-gpu" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            key={isMobile ? 'mobile-view' : 'desktop-view'}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              {currentContent.badge}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight leading-[1.1] text-foreground">
                {currentContent.title.split(',').map((part, i) => (
                    <span key={i} className={i === 1 ? "text-primary italic" : ""}>
                        {part}{i === 0 && currentContent.title.includes(',') ? ',' : ''}
                        {i === 0 && <br/>}
                    </span>
                ))}
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-medium">
              {currentContent.desc}
            </p>

            <div className="space-y-4 max-w-md">
                {currentContent.features.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-md shadow-sm transition-transform hover:scale-[1.02] transform-gpu">
                        <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] cursor-pointer group w-fit transition-all">
                {currentContent.linkText}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          <div className="relative flex justify-center lg:justify-end transform-gpu min-h-[500px] items-center">
            <AnimatePresence mode="wait">
                {!isMobile ? (
                    /* Mockup de iPhone (Mostrado no Desktop) */
                    <motion.div 
                        key="iphone-mockup"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -20, 0] }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ 
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            default: { duration: 0.5 }
                        }}
                        className="relative border-zinc-900 bg-zinc-900 border-[10px] rounded-[3.5rem] h-[600px] w-[290px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/20 overflow-hidden transform-gpu"
                    >
                        <div className="rounded-[2.8rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                            <div className="h-12 w-full flex justify-between items-center px-8 pt-2">
                                <span className="text-[11px] font-black tracking-tight">9:41</span>
                                <div className="flex gap-1.5 items-center">
                                    <Signal size={10} strokeWidth={3} />
                                    <Wifi size={10} strokeWidth={3} />
                                    <div className="w-5 h-2.5 border border-foreground/30 rounded-[2px] relative">
                                        <div className="absolute top-0.5 left-0.5 bottom-0.5 right-1 bg-foreground rounded-[1px]" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-5 space-y-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="bg-primary/10 p-1.5 rounded-lg">
                                        <Logo className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-headline font-bold text-sm text-primary">AtelierFlow</span>
                                </div>
                                <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-inner border border-muted/20 bg-muted/5">
                                    <Image 
                                        src="/images/dashboard3.png" 
                                        alt="App no Celular" 
                                        fill 
                                        className="object-cover object-top"
                                    />
                                </div>
                            </div>
                            <div className="h-1.5 w-32 bg-foreground/10 rounded-full mx-auto mb-2" />
                        </div>
                        <div className="absolute top-0 right-0 w-full h-full pointer-events-none rounded-[3.5rem] bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-20" />
                    </motion.div>
                ) : (
                    /* Mockup de Desktop (Mostrado no Mobile) */
                    <motion.div 
                        key="desktop-mockup"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-xl group"
                    >
                        <div className="bg-zinc-900/5 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative transform-gpu transition-transform">
                            {/* Safari Header */}
                            <div className="h-8 w-full bg-white/10 border-b border-white/10 flex items-center px-4 gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-2 h-2 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="flex-1 max-w-[200px] mx-auto h-5 bg-black/10 rounded flex items-center justify-center px-2">
                                    <span className="text-[8px] font-medium opacity-40">atelierflow.com.br</span>
                                </div>
                            </div>
                            {/* Browser Content */}
                            <div className="relative aspect-video">
                                <Image
                                    src="/images/dashboard1.png"
                                    alt="AtelierFlow Dashboard Desktop"
                                    fill
                                    className="object-cover object-top"
                                />
                            </div>
                        </div>
                        {/* Floating Printer Badge */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-6 -right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 z-30"
                        >
                            <div className="bg-primary/20 p-2 rounded-full">
                                <Printer className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col items-start pr-2">
                                <span className="text-[8px] font-black uppercase text-muted-foreground">Recurso Pro</span>
                                <span className="text-[10px] font-bold">Imprimir Comprovante</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
