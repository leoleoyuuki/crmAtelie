"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "O AtelierFlow transformou minha gestão financeira. Agora sei exatamente quanto lucro em cada peça e parei de misturar dinheiro pessoal com o do ateliê.",
    by: "Natalia, Ateliê Costura Criativa",
    imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
  },
  {
    tempId: 1,
    testimonial: "Finalmente consegui organizar minha montanha de pedidos. Visualizar os números e o crescimento do mês me deu a clareza que eu nunca tive com cadernos.",
    by: "Alcimara, Artesanato & Cia",
    imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop"
  },
  {
    tempId: 2,
    testimonial: "Nunca mais atrasei uma entrega. O painel de tarefas é sensacional para priorizar o que é urgente e manter os clientes sempre informados.",
    by: "Nathan, Alfaiataria Moderna",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
  },
  {
    tempId: 3,
    testimonial: "O sistema é tão simples que parece que foi feito pensando no meu dia a dia corrido. Meus clientes adoram receber o comprovante no WhatsApp.",
    by: "Maria, Bordados de Luxo",
    imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
  },
  {
    tempId: 4,
    testimonial: "A tabela de preços padronizada me ajudou a passar orçamentos muito mais rápidos. Profissionalizou meu atendimento no balcão.",
    by: "Joana, Ateliê da Jô",
    imgSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
  }
];

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out rounded-xl shadow-xl",
        isCenter 
          ? "z-10 bg-primary text-primary-foreground border-primary scale-105" 
          : "z-0 bg-card text-card-foreground border-border hover:border-primary/50 scale-90 opacity-40 grayscale blur-[1px]"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -20 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 20px 40px -10px rgba(0,0,0,0.3)" : "none"
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        {/* <img
            src={testimonial.imgSrc}
            alt={`${testimonial.by.split(',')[0]}`}
            className="h-14 w-14 rounded-full border-2 border-primary/20 object-cover"
        /> */}
        <Quote className={cn("h-8 w-8 opacity-20", isCenter ? "text-primary-foreground" : "text-primary")} />
      </div>
      
      <h3 className={cn(
        "text-sm sm:text-xl font-headline font-bold leading-relaxed",
        isCenter ? "text-primary-foreground" : "text-foreground"
      )}>
        "{testimonial.testimonial}"
      </h3>
      
      <div className={cn(
        "absolute bottom-8 left-8 right-8",
        isCenter ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        <p className="text-sm font-bold">{testimonial.by.split(',')[0]}</p>
        <p className="text-xs italic opacity-70">{testimonial.by.split(',')[1]}</p>
      </div>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 300);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-muted/10 py-20"
      style={{ height: 650 }}
    >
      <div className="container mx-auto px-4 relative z-20 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Criado por e para artesãos</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">Veja como profissionais reais estão transformando seus ateliês com o AtelierFlow.</p>
      </div>

      <div className="relative h-[450px]">
        {testimonialsList.map((testimonial, index) => {
            const position = index - Math.floor(testimonialsList.length / 2);
            return (
            <TestimonialCard
                key={testimonial.tempId}
                testimonial={testimonial}
                handleMove={handleMove}
                position={position}
                cardSize={cardSize}
            />
            );
        })}
      </div>

      <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-4 z-30">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
            "bg-white border-2 border-border hover:border-primary hover:text-primary shadow-lg active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Depoimento anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
            "bg-white border-2 border-border hover:border-primary hover:text-primary shadow-lg active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Próximo depoimento"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
