'use client';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const objections = [
  {
    icon: MessageCircle,
    question: "“Não sou boa com tecnologia”",
    answer: "Se você sabe usar WhatsApp, sabe usar o AtelierFlow. O sistema é simples, intuitivo e sem termos técnicos complicados.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500"
  },
  {
    icon: Clock,
    question: "“Vai me tomar muito tempo”",
    answer: "Pelo contrário. Você cadastra um pedido em menos de 1 minuto e economiza horas que antes perdia procurando anotações.",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500"
  },
  {
    icon: Zap,
    question: "“Já tentei planilha e não deu certo”",
    answer: "O sistema faz o trabalho pesado por você. Ele organiza os prazos e calcula o financeiro automaticamente, sem fórmulas.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary"
  }
];

export function FaqSection() {
  return (
    <div className="py-24 sm:py-40 relative overflow-hidden bg-background">
      {/* Elementos de fundo dinâmicos */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Entendemos os desafios do dia a dia. O AtelierFlow foi desenhado para ser o seu braço direito, não mais um problema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {objections.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.15, 
                type: "spring", 
                stiffness: 100, 
                damping: 15 
              }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Card Glassmorphism */}
              <div className="h-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:border-primary/30 group-hover:bg-white/10">
                
                {/* Background Gradient Glow */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] -z-10",
                  item.color
                )} />

                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg bg-background/50",
                  item.iconColor
                )}>
                  <item.icon className="h-7 w-7" />
                </div>

                <h3 className="text-xl md:text-2xl font-bold font-headline mb-4 text-foreground leading-tight group-hover:text-primary transition-colors">
                  {item.question}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>

                {/* Decorative element */}
                <div className="absolute top-6 right-8 text-4xl font-black text-foreground/5 pointer-events-none select-none">
                  0{index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-muted-foreground font-medium italic">
            Ainda com dúvidas? <span className="text-primary font-bold not-italic cursor-pointer hover:underline">Fale com a gente no WhatsApp.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
