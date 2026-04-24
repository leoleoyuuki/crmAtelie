"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Instagram, MessageCircle, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonialsRow1 = [
  {
    id: 1,
    content: "A diferença não está no preço. Pra mim pelo menos é muito mais rápido montar orçamentos e entender o lucro real de cada peça. A interface é linda, intuitiva e o fluxo de impressões térmicas me economizou muito tempo.",
    author: "Natália",
    role: "Costura Criativa",
    source: "instagram"
  },
  {
    id: 2,
    content: "Parei de usar planilhas que travavam! O AtelierFlow faz os cálculos automáticos de margem de lucro, e os clientes amam a organização e os PDFs com a minha marca.",
    author: "Alcimara",
    role: "Artesanato & Cia",
    source: "whatsapp"
  },
  {
    id: 3,
    content: "Um detalhe bobo: o dashboard do celular é IDÊNTICO a um aplicativo, super fluído. Posso olhar o histórico de qualquer cliente do meu bolso, em segundos.",
    author: "Doce Papel",
    role: "Papelaria",
    source: "threads"
  },
  {
    id: 4,
    content: "Sempre que pergunto 'qual vai ser a próxima novidade?', vocês lançam algo novo e me surpreendem!! Muito rápido, recomendo 1000 vezes.",
    author: "Carla Laços",
    role: "Acessórios Infantis",
    source: "instagram"
  },
  {
    id: 5,
    content: "O AtelierFlow transformou minha gestão financeira. Agora sei exatamente quanto lucro em cada peça que faço por encomenda.",
    author: "Marly Artes",
    role: "Crochê",
    source: "whatsapp"
  }
];

const testimonialsRow2 = [
  {
    id: 6,
    content: "Eu fiquei besta com a qualidade, já tô migrando todas as minhas encomendas ativas pra cá o mais rápido possível!!",
    author: "Rafaela Tricô",
    role: "Tricot Moderno",
    source: "instagram"
  },
  {
    id: 7,
    content: "Ok, o AtelierFlow é realmente MUITO bom. Acabei de realizar a migração e, finalmente, tenho tudo centralizado. Sem mais bloquinhos de papel perdidos pela mesa.",
    author: "Ju Marrone",
    role: "Costura de Roupas",
    source: "threads"
  },
  {
    id: 8,
    content: "Gente, parabéns! O software tá super ajustado para artesanato. Estou explorando todas as funcionalidades e é incrível e intuitivo.",
    author: "Bordados da Ana",
    role: "Bordado Livre",
    source: "whatsapp"
  },
  {
    id: 9,
    content: "Cara, testei MUITOS aplicativos antes... e nenhum foca de verdade no modelo de 'pedidos complexos'. Aqui eu gerencio prazos, recebimentos parcelados, perfeitamente.",
    author: "Leo Custom",
    role: "Pintura em Porcelana",
    source: "instagram"
  },
  {
    id: 10,
    content: "Eu acordo pensando: como a gente ficava sem isso antes? A experiência do cliente na hora de ver o orçamento e as datas nunca foi tão profissional.",
    author: "Mimos da Gabi",
    role: "Lembrancinhas",
    source: "threads"
  }
];

const TestimonialCard = ({ data }: { data: typeof testimonialsRow1[0] }) => {
  return (
    <div className="w-[300px] sm:w-[350px] flex-shrink-0 bg-white/95 dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 dark:border-white/10 transition-transform hover:-translate-y-1 hover:shadow-md cursor-default flex flex-col">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {data.author[0]}
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground leading-tight">
              {data.author}
            </h4>
            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-black mt-1 inline-block">
              {data.role}
            </span>
          </div>
        </div>
        <div className="text-muted-foreground/40 mt-1">
          {data.source === 'instagram' && <Instagram size={20} />}
          {data.source === 'whatsapp' && <MessageCircle size={20} />}
          {data.source === 'threads' && <Hash size={20} />}
        </div>
      </div>
      <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-medium whitespace-normal">
        {data.content}
      </p>
    </div>
  );
};

const MarqueeRow = ({ items, direction = "left", speed = 10 }: { items: typeof testimonialsRow1, direction?: "left" | "right", speed?: number }) => {
  return (
    <div className="relative flex overflow-hidden w-full group">
      <div 
        className={cn("flex whitespace-nowrap min-w-full gap-6 px-3 will-change-transform")}
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {/* Duplicate the children to create the infinite scroll effect */}
        {[0, 1, 2].map((groupIndex) => (
          <div key={groupIndex} className="flex gap-6">
            {items.map((t) => (
              <TestimonialCard key={`${groupIndex}-${t.id}`} data={t} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-background pb-20 pt-16">
      {/* 
        Linear Gradient Transition 
        Starts EXACTLY with the color of the previous section (muted/20) to eliminate the sharp line,
        then gracefully blends into a primary tint, and finally fades to transparent.
      */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-muted/20 via-primary/10 to-transparent z-10 pointer-events-none" />

      {/* Crepe Paper Texture Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'url(/images/crepe-paper-muted.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-20 text-center mb-16 pt-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold mb-6 text-foreground tracking-tight">
          Resultados Provados. <br className="sm:hidden" />
          <span className="text-primary italic">Impacto Poderoso.</span>
        </h2>
        <p className="text-muted-foreground font-medium max-w-xl mx-auto text-lg">
          Aprovado por artesãos que revolucionaram a forma de gerenciar seus negócios.
        </p>
      </div>

      <div className="relative z-20 flex flex-col gap-6 w-full">
        {/* Left and Right Overlays for fading effect (Better performance than mask-image) */}
        <div className="absolute top-0 left-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-background to-transparent z-30 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />
        
        <MarqueeRow items={testimonialsRow1} direction="left" speed={25} />
        <MarqueeRow items={testimonialsRow2} direction="right" speed={22} />
      </div>

      <style jsx global>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-33.33%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};