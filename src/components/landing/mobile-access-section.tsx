'use client';
import { motion } from 'framer-motion';
import Logo from '../icons/logo';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export function MobileAccessSection() {
  return (
    <div className="py-20 sm:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              Acesso Rápido
            </div>
            <h2 className="mt-4 text-3xl font-bold font-headline tracking-tight sm:text-4xl">
              Leve seu ateliê no bolso, como um app
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Adicione o AtelierFlow à tela inicial do seu celular. Tenha uma experiência de aplicativo nativo, com acesso rápido e sem precisar baixar nada pela loja de aplicativos.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Funciona em qualquer smartphone (iOS e Android) através do navegador, com a opção "Adicionar à Tela de Início".
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background relative">
                    <Image
                        src="https://images.unsplash.com/photo-1528732228833-25396f1d939a?q=80&w=800&auto=format&fit=crop"
                        alt="Fundo de tela de celular abstrato"
                        fill
                        className="object-cover"
                        data-ai-hint="abstract texture"
                    />
                    <div className="absolute bottom-16 left-0 right-0 p-4">
                        <div className="grid grid-cols-4 gap-4 justify-items-center">
                            {/* Placeholder for other apps */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-14 w-14 bg-muted/50 backdrop-blur-sm rounded-2xl"></div>
                            </div>
                             <div className="flex flex-col items-center gap-1">
                                <div className="h-14 w-14 bg-muted/50 backdrop-blur-sm rounded-2xl"></div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-14 w-14 bg-muted/50 backdrop-blur-sm rounded-2xl"></div>
                            </div>
                             {/* AtelierFlow App Icon */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-14 w-14 bg-card/80 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-md">
                                    <Logo className="h-10 w-10 text-primary" />
                                </div>
                                <span className="text-xs text-white mix-blend-difference font-medium">AtelierFlow</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
