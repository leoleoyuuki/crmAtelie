'use client';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export function TutorialsSection() {
  return (
    <div className="py-20 sm:py-28 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <PlayCircle className="h-4 w-4 mr-2" />
              Aprendizado Prático
            </div>
            <h2 className="mt-4 text-3xl font-bold font-headline tracking-tight sm:text-4xl">
              Domine o sistema sem esforço
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Não se preocupe se você não tem tempo a perder. Nossa central de ajuda possui tutoriais em vídeo, curtos e diretos, que mostram na prática como usar cada funcionalidade do AtelierFlow.
            </p>
            <p className="mt-4 text-muted-foreground">
                Do cadastro de clientes à gestão financeira, você aprenderá tudo o que precisa para transformar a organização do seu ateliê em minutos.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/login">Começar e ver os tutoriais</Link>
                </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Card className="relative aspect-video w-full max-w-lg rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/10 bg-muted">
                <CardContent className="absolute inset-0 flex items-center justify-center p-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20" />
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-4">
                        <PlayCircle className="h-16 w-16 text-white" />
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
