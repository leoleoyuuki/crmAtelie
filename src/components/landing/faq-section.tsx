'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, Clock, Zap } from 'lucide-react';

const objections = [
  {
    icon: MessageCircle,
    question: "“Não sou boa com tecnologia”",
    answer: "Se você sabe usar WhatsApp, sabe usar o AtelierFlow. O sistema é simples, intuitivo e sem termos técnicos complicados."
  },
  {
    icon: Clock,
    question: "“Vai me tomar muito tempo”",
    answer: "Pelo contrário. Você cadastra um pedido em menos de 1 minuto e economiza horas que antes perdia procurando anotações."
  },
  {
    icon: Zap,
    question: "“Já tentei planilha e não deu certo”",
    answer: "O sistema faz o trabalho pesado por você. Ele organiza os prazos e calcula o financeiro automaticamente, sem fórmulas."
  }
];

export function FaqSection() {
  return (
    <div className="py-20 sm:py-28 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">
            Feito para a sua realidade
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Entendemos os desafios do dia a dia de um ateliê artesanal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {objections.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border bg-background shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-headline mb-3 text-primary">
                {item.question}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
