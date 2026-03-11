"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const testimonials = [
  {
    tempId: 0,
    testimonial: "O AtelierFlow transformou minha gestão financeira. Agora sei exatamente quanto lucro em cada peça.",
    by: "Natalia",
    role: "Costura Criativa",
  },
  {
    tempId: 1,
    testimonial: "Finalmente consegui organizar meus pedidos e visualizar os números do meu ateliê com clareza.",
    by: "Alcimara",
    role: "Artesanato & Cia",
  },
  {
    tempId: 2,
    testimonial: "O sistema é incrível para não se perder com os prazos. Meus clientes adoram a organização.",
    by: "Nathan",
    role: "Alfaiataria Moderna",
  }
];

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}: TestimonialCardProps) => {
  const isCenter = position === 0;

  return (
    <motion.div
      onClick={() => handleMove(position)}
      initial={false}
      animate={{
        x: `calc(-50% + ${(cardSize / 1.6) * position}px)`,
        y: `calc(-50% + ${isCenter ? -20 : (position % 2 ? 10 : -10)}px)`,
        scale: isCenter ? 1 : 0.85,
        rotate: isCenter ? 0 : position * 2,
        opacity: isCenter ? 1 : 0.4,
        zIndex: 10 - Math.abs(position),
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer p-6 sm:p-8 rounded-[2rem] border-2 transition-all transform-gpu",
        isCenter 
          ? "bg-primary text-primary-foreground border-primary shadow-2xl" 
          : "bg-card text-card-foreground border-border grayscale blur-[0.5px]"
      )}
      style={{
        width: cardSize,
        height: cardSize,
      }}
    >
      <div className="flex items-center gap-4 mb-6">
        <Quote className={cn("h-6 w-6 opacity-20", isCenter ? "text-primary-foreground" : "text-primary")} />
      </div>
      
      <h3 className={cn(
        "text-md sm:text-xl font-headline font-bold leading-relaxed line-clamp-4",
        isCenter ? "text-primary-foreground" : "text-foreground"
      )}>
        "{testimonial.testimonial}"
      </h3>
      
      <div className={cn(
        "absolute bottom-8 left-8 right-8",
        isCenter ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        <p className="text-sm font-bold">{testimonial.by}</p>
        <p className="text-xs italic opacity-70">{testimonial.role}</p>
      </div>
    </motion.div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(340);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    if (steps === 0) return;
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = 0; i < steps; i++) {
        const item = newList.shift();
        if (item) newList.push(item);
      }
    } else {
      for (let i = 0; i < Math.abs(steps); i++) {
        const item = newList.pop();
        if (item) newList.unshift(item);
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      setCardSize(window.innerWidth < 640 ? 280 : 340);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative w-full h-[550px] overflow-hidden bg-muted/5 py-20">
      <div className="container mx-auto px-4 relative z-20 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">O que dizem nossos artesãos</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">Histórias reais de quem transformou o ateliê com o AtelierFlow.</p>
      </div>

      <div className="relative h-[350px] transform-gpu">
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

      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-4 z-30">
        <button
          onClick={() => handleMove(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white border shadow-md hover:bg-muted transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white border shadow-md hover:bg-muted transition-colors"
          aria-label="Próximo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};