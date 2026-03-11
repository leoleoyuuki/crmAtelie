'use client';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const objections = [
  {
    icon: MessageCircle,
    question: "“Não sou boa com tecnologia”",
    answer: "Se você sabe usar WhatsApp, sabe usar o AtelierFlow. O sistema é simples, intuitivo e sem termos técnicos.",
    color: "from-blue-500/10 to-transparent",
    iconColor: "text-blue-500"
  },
  {
    icon: Clock,
    question: "“Vai me tomar muito tempo”",
    answer: "Pelo contrário. Você cadastra um pedido em segundos e economiza horas procurando anotações.",
    color: "from-orange-500/10 to-transparent",
    iconColor: "text-orange-500"
  },
  {
    icon: Zap,
    question: "“Já tentei planilha e não deu”",
    answer: "O sistema faz o trabalho pesado. Organiza prazos e calcula o financeiro automaticamente.",
    color: "from-primary/10 to-transparent",
    iconColor: "text-primary"
  }
];

export function FaqSection() {
  return (
    <div className="py-24 sm:py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles className="h-3 w-3" />
            Sua Realidade
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground leading-tight">
            Feito para quem <br/>
            <span className="text-primary italic">não tem tempo a perder</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transform-gpu">
          {objections.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-primary/30">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-background/50 shadow-sm",
                  item.iconColor
                )}>
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold font-headline mb-4 text-foreground leading-tight">
                  {item.question}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}