
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Smartphone, CheckCircle2, Printer, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';
import { Safari } from '@/components/ui/safari';

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
        { icon: CheckCircle2, title: "Acesso Rápido", desc: "Contatos e prazos sempre à mão no atendimento." }
      ],
      linkText: "Saiba como instalar no seu celular"
    }
  };

  const currentContent = isMobile ? content.mobile : content.desktop;

  return (
    <div className="py-24 sm:py-40 relative overflow-hidden bg-background">
      {/* Elementos de Fundo */}
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

          <div className="relative flex justify-center lg:justify-end transform-gpu min-h-fit lg:min-h-[600px] items-center py-10 lg:py-0">
            <AnimatePresence mode="wait">
                {!isMobile ? (
                    /* Mobile Mockup (iPhone) - Exibido no Desktop */
                    <motion.div 
                        key="iphone-mockup"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-center py-10 relative"
                    >
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[550px] w-[270px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/20 overflow-hidden"
                        >
                            {/* Interface Content */}
                            <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-background relative flex flex-col">
                                {/* Dynamic Island */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-3xl z-50" />
                                
                                {/* Mobile Image */}
                                <div className="flex-1 relative">
                                    <Image
                                        src="/images/dashboard3.png"
                                        alt="AtelierFlow Dashboard Mobile"
                                        fill
                                        className="object-cover object-top"
                                        priority
                                    />
                                </div>
                                {/* Home Indicator */}
                                <div className="h-1 w-24 bg-foreground/10 rounded-full mx-auto mb-2" />
                            </div>
                        </motion.div>
                        
                        {/* Glow behind phone */}
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full" />
                    </motion.div>
                ) : (
                    /* Mockup de Safari - Exibido no Mobile (Usuário Mobile vendo versão Desktop) */
                    <motion.div 
                        key="desktop-mockup"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex justify-center"
                    >
                        <Safari 
                          src="/images/dashboard5.png" 
                          className="w-full shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
