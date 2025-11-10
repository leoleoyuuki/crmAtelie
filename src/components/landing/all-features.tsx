
'use client';

import {
  BarChart3,
  Eye,
  ListChecks,
  Printer,
  StickyNote,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const features = [
  {
    icon: StickyNote,
    title: 'Gestão de Pedidos Flexível',
    description:
      'Crie, edite e acompanhe todos os pedidos em um único lugar, com múltiplos serviços por cliente.',
    benefit: 'Agilidade e Organização',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Inteligente',
    description:
      'Visão completa do seu negócio com gráficos de faturamento, volume de pedidos e serviços mais populares.',
    benefit: 'Decisões Baseadas em Dados',
  },
  {
    icon: ListChecks,
    title: 'Tarefas do Dia Priorizadas',
    description:
      'Agenda diária que organiza todos os itens por ordem de urgência, garantindo pontualidade.',
    benefit: 'Produtividade e Foco',
  },
  {
    icon: Users,
    title: 'Cadastro de Clientes e Comunicação',
    description:
      'Mantenha um banco de dados de clientes e envie notificações via WhatsApp com um clique.',
    benefit: 'Profissionalismo e Fidelização',
  },
  {
    icon: Printer,
    title: 'Impressão e Tabela de Preços',
    description:
      'Gere comprovantes detalhados para cada pedido e padronize os valores dos seus serviços.',
    benefit: 'Consistência e Eficiência',
  },
  {
    icon: Eye,
    title: 'Modo de Privacidade',
    description:
      'Proteja seus dados financeiros com um modo que oculta valores sensíveis, protegido por senha.',
    benefit: 'Segurança e Confidencialidade',
  },
];

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export function AllFeatures() {
  return (
    <div className="bg-card py-20 sm:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">
            Todas as ferramentas para transformar seu ateliê
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Do pedido à entrega, o AtelierFlow foi pensado para simplificar cada
            etapa do seu fluxo de trabalho.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="h-full text-center flex flex-col items-center">
                <CardHeader>
                  <div className="bg-primary/10 p-4 rounded-full mx-auto w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl font-headline mb-2">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
