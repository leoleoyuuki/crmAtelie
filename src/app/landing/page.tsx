
'use client';

import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  StickyNote,
  BarChart3,
  ListChecks,
  Users,
  Printer,
  Eye,
} from 'lucide-react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

function AnimatedSection({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="py-16 sm:py-24"
    >
      {children}
    </motion.div>
  );
}

const features = [
    {
      title: 'Gestão de Pedidos Centralizada',
      description: 'Crie, edite e acompanhe todos os pedidos em um único lugar, com múltiplos serviços por cliente.',
      icon: StickyNote,
      benefit: 'Agilidade e Organização.'
    },
    {
      title: 'Dashboard Inteligente e Visual',
      description: 'Tenha uma visão completa do seu negócio com gráficos de faturamento, volume de pedidos e mais.',
      icon: BarChart3,
      benefit: 'Decisões Baseadas em Dados.'
    },
    {
      title: 'Tarefas do Dia Priorizadas',
      description: 'Agenda diária que organiza todos os itens por ordem de urgência, garantindo pontualidade.',
      icon: ListChecks,
      benefit: 'Produtividade e Pontualidade.'
    },
    {
      title: 'Cadastro de Clientes e Comunicação',
      description: 'Mantenha um banco de dados de clientes e envie notificações via WhatsApp com um clique.',
      icon: Users,
      benefit: 'Profissionalismo e Fidelização.'
    },
    {
      title: 'Impressão e Tabela de Preços',
      description: 'Gere comprovantes detalhados para cada pedido e padronize os valores dos seus serviços.',
      icon: Printer,
      benefit: 'Consistência e Eficiência.'
    },
    {
      title: 'Modo de Privacidade',
      description: 'Proteja seus dados financeiros com um modo que oculta valores sensíveis, protegido por senha.',
      icon: Eye,
      benefit: 'Segurança e Confidencialidade.'
    },
];

const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => (
    <motion.div variants={itemVariants}>
      <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-headline">{feature.title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{feature.description}</p>
          <p className="mt-3 font-semibold text-primary">{feature.benefit}</p>
        </CardContent>
      </Card>
    </motion.div>
);

const FeatureHighlight = ({
  title,
  text,
  imageSrc,
  imageAlt,
  reverse = false,
}: {
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}) => (
  <motion.div
    variants={itemVariants}
    className={`flex flex-col lg:flex-row items-center gap-12 ${
      reverse ? 'lg:flex-row-reverse' : ''
    }`}
  >
    <div className="lg:w-1/2">
      <h3 className="text-3xl font-headline font-bold tracking-tight text-primary">
        {title}
      </h3>
      <p className="mt-4 text-lg text-muted-foreground">{text}</p>
    </div>
    <div className="lg:w-1/2">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={600}
        height={400}
        className="rounded-lg shadow-2xl object-cover"
        data-ai-hint="abstract texture"
      />
    </div>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">
              AtelierFlow
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Acessar o Sistema</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Começar Agora</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <AnimatedSection>
          <div className="container mx-auto px-4 text-center md:px-6">
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold font-headline tracking-tighter text-primary sm:text-5xl md:text-6xl"
            >
              A gestão do seu ateliê, elevada a outro nível.
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Chega de comandas de papel e planilhas confusas. Com o AtelierFlow,
              você organiza pedidos, controla finanças e ganha tempo para focar
              no que realmente importa: sua arte.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Comece a organizar seu ateliê</Link>
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Feature Highlights */}
        <AnimatedSection>
          <div className="container mx-auto px-4 md:px-6 space-y-24">
            <FeatureHighlight
              title="Organização que Liberta: Fim da Bagunça, Início da Produtividade."
              text="Centralize todos os pedidos, clientes e serviços em um único lugar. Crie ordens de serviço detalhadas em segundos e saiba exatamente o que precisa ser feito, sem o estresse da desorganização."
              imageSrc="https://picsum.photos/seed/atelier1/600/400"
              imageAlt="Mesa de ateliê organizada"
            />
            <FeatureHighlight
              title="Decisões Inteligentes com um Olhar: Seu Ateliê em Números."
              text="Nosso dashboard visual transforma dados complexos em insights claros. Acompanhe o faturamento, identifique os serviços mais lucrativos e entenda as tendências do seu negócio para planejar o futuro com confiança."
              imageSrc="https://picsum.photos/seed/charts2/600/400"
              imageAlt="Gráficos de dados em um dashboard"
              reverse
            />
          </div>
        </AnimatedSection>
        
        {/* All Features Section */}
        <AnimatedSection>
            <div className="container mx-auto px-4 md:px-6">
                <motion.div variants={itemVariants} className="text-center">
                    <h2 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl">
                        Todas as ferramentas que você precisa
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Do pedido à entrega, o AtelierFlow foi pensado para simplificar cada etapa do seu fluxo de trabalho.
                    </p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </motion.div>
            </div>
        </AnimatedSection>

        {/* Final CTA */}
        <AnimatedSection>
          <div className="container mx-auto px-4 text-center md:px-6">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold font-headline tracking-tighter text-primary sm:text-4xl"
            >
              Pronto para transformar seu ateliê?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
            >
              Junte-se a outros artesãos e costureiros que estão economizando
              tempo e profissionalizando a gestão do seu negócio.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Acessar minha conta</Link>
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              AtelierFlow
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AtelierFlow. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
