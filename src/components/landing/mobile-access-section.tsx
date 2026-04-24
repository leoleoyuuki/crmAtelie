'use client';
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Smartphone, CheckCircle2, Printer, Monitor, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';
import { Safari } from '@/components/ui/safari';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function MobileAccessSection() {
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);

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
      {/* Crumpled Paper Texture Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'url(/images/crumpled-paper-texture.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />

      {/* Static background blobs — no animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div
            key={isMobile ? 'mobile-view' : 'desktop-view'}
            className="space-y-8 animate-fade-in-up"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              {currentContent.badge}
            </div>

            <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight leading-[1.1] text-foreground">
              {currentContent.title.split(',').map((part, i) => (
                <span key={i} className={i === 1 ? "text-primary italic" : ""}>
                  {part}{i === 0 && currentContent.title.includes(',') ? ',' : ''}
                  {i === 0 && <br />}
                </span>
              ))}
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-medium">
              {currentContent.desc}
            </p>

            <div className="space-y-4 max-w-md">
              {currentContent.features.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 backdrop-blur-md shadow-sm transition-transform hover:scale-[1.02] will-change-transform">
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

            <div
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] cursor-pointer group w-fit transition-all hover:opacity-80"
            >
              {currentContent.linkText}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="sm:max-w-[450px] border-primary/10 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2">
                    {isMobile ? <Monitor className="h-6 w-6 text-primary" /> : <Smartphone className="h-6 w-6 text-primary" />}
                    {isMobile ? "Acessar no Computador" : "Instalar no Celular"}
                  </DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    {isMobile
                      ? "Tenha uma visão profissional completa do seu ateliê em uma tela maior."
                      : "Leve seu ateliê no bolso com a experiência de um aplicativo nativo."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-primary/5">
                      <div className="bg-primary/10 h-8 w-8 rounded-lg flex items-center justify-center text-primary shrink-0 font-bold text-sm">1</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Acesse o endereço</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          Abra o site <span className="text-primary font-bold">atelierflow.com.br</span> no navegador.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-primary/5">
                      <div className="bg-primary/10 h-8 w-8 rounded-lg flex items-center justify-center text-primary shrink-0 font-bold text-sm">2</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">
                          {isMobile ? "Faça Login" : "Adicione à Tela de Início"}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {isMobile
                            ? "Entre com sua conta para sincronizar todos os seus dados instantaneamente."
                            : "No iPhone toque em 'Compartilhar' e 'Tela de Início'. No Android toque nos '3 pontos' e 'Instalar'."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <div className="bg-primary/20 h-8 w-8 rounded-lg flex items-center justify-center text-primary shrink-0">
                        <Download className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-primary">Instale como Aplicativo</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {isMobile
                            ? "No computador, clique no ícone de instalação na barra de endereços para ter o ícone do App na sua área de trabalho."
                            : "Isso criará um ícone na sua tela inicial para acesso rápido, igual a um aplicativo baixado na loja."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Entendi
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative flex justify-center lg:justify-end min-h-fit lg:min-h-[600px] items-center py-10 lg:py-0">
            {!isMobile ? (
              /* iPhone mockup — float via CSS */
              <div className="flex justify-center py-10 relative">
                <div className="animate-float relative border-zinc-900 bg-zinc-900 border-[8px] rounded-[3rem] h-[550px] w-[270px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/20 overflow-hidden">
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
                </div>
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full" />
              </div>
            ) : (
              /* Safari Desktop Mockup */
              <div className="w-full flex justify-center">
                <Safari
                  src="/images/dashboard5.png"
                  className="w-full shadow-2xl"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
