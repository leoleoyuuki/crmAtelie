
'use client';
import { motion } from 'framer-motion';
import { StickyNote, BarChart3, ListChecks } from 'lucide-react';

const highlights = [
  {
    icon: StickyNote,
    title: 'Organização que Liberta',
    description: 'Centralize todos os pedidos, clientes e serviços. Crie ordens de serviço detalhadas em segundos e saiba exatamente o que precisa ser feito, sem o estresse da desorganização.',
  },
  {
    icon: BarChart3,
    title: 'Decisões Inteligentes com um Olhar',
    description: 'Nosso dashboard visual transforma dados complexos em insights claros. Acompanhe o faturamento, identifique os serviços mais lucrativos e planeje o futuro com confiança.',
  },
  {
    icon: ListChecks,
    title: 'Produtividade Sem Esforço',
    description: 'A agenda de tarefas prioriza automaticamente os trabalhos por urgência, garantindo que você e sua equipe foquem no que realmente importa: cumprir prazos.',
  },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
        duration: 0.5,
        ease: 'easeOut',
        },
    },
};


export function FeatureHighlights() {
  return (
    <div className="py-20 sm:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
            <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">
                Menos papelada, mais arte.
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                O AtelierFlow foi desenhado para eliminar as tarefas chatas e repetitivas,
                liberando seu tempo para o que você faz de melhor.
            </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3"
        >
          {highlights.map((highlight) => (
            <motion.div key={highlight.title} variants={itemVariants} className="text-center">
              <div className="bg-primary/10 p-5 rounded-full inline-block">
                <highlight.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-bold font-headline">{highlight.title}</h3>
              <p className="mt-2 text-muted-foreground">{highlight.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
