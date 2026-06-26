'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import Logo from '../icons/logo';
import { trackFbqEvent } from '@/lib/fpixel';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriptionDrawer } from '../subscription-drawer';
import { ChevronDown, Mic, Calendar, DollarSign, Calculator, Sparkles } from 'lucide-react';

export function Header() {
  const [plansOpen, setPlansOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleLeadClick = () => {
    // Lead track removido para evitar ruído (será disparado apenas no cadastro real)
  };

  const handleScrollToRecursos = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setInfoOpen(false);
    const element = document.getElementById('recursos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="w-full max-w-6xl rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-xl shadow-zinc-200/10 dark:shadow-zinc-950/30 relative overflow-hidden pointer-events-auto"
        >
          {/* Header Bar */}
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left: Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <Logo className="h-8 w-8 text-primary" />
                </motion.div>
                <span className="text-lg font-bold font-headline text-foreground group-hover:text-primary transition-colors">
                  AtelierFlow
                </span>
              </Link>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors text-sm rounded-full flex items-center gap-1 text-zinc-700 dark:text-zinc-300"
                onClick={() => setInfoOpen(!infoOpen)}
              >
                Como Funciona
                <motion.span
                  animate={{ rotate: infoOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors text-sm rounded-full text-zinc-700 dark:text-zinc-300"
                onClick={handleScrollToRecursos}
              >
                Funções Especiais
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors text-sm rounded-full text-zinc-700 dark:text-zinc-300"
                onClick={() => {
                  setPlansOpen(true);
                  setInfoOpen(false);
                }}
              >
                Planos
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
              {/* Mobile-only menu items */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-primary/10 transition-colors text-xs rounded-full flex items-center gap-1 text-zinc-700 dark:text-zinc-300"
                onClick={() => setInfoOpen(!infoOpen)}
              >
                Como Funciona
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-primary/10 transition-colors text-xs rounded-full text-zinc-700 dark:text-zinc-300"
                onClick={handleScrollToRecursos}
              >
                Recursos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-primary/10 transition-colors text-xs rounded-full text-zinc-700 dark:text-zinc-300"
                onClick={() => {
                  setPlansOpen(true);
                  setInfoOpen(false);
                }}
              >
                Planos
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex hover:bg-primary/10 transition-colors text-sm rounded-full text-zinc-700 dark:text-zinc-300"
                onClick={handleLeadClick}
              >
                <Link href="/login">Acessar</Link>
              </Button>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Button asChild size="sm" onClick={handleLeadClick} className="shadow-md shadow-primary/20 rounded-full">
                  <Link href="/login?mode=signup">Testar grátis</Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Expandable Info Panel */}
          <AnimatePresence>
            {infoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden"
              >
                {/* Welcome Message */}
                <div className="px-6 pt-6 pb-2 text-center sm:text-left">
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5 font-headline">
                    Organização sob medida para o seu talento
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                    Se você vive na correria entre linhas e agulhas, costuma se perder nos prazos de entrega ou nunca sabe ao certo para onde o dinheiro do ateliê está indo, você encontrou quem vai melhorar a sua vida. O AtelierFlow simplifica sua rotina de costura e artesanato:
                  </p>
                </div>

                <div className="p-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                      <Mic className="h-4 w-4" />
                    </div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Alimentação por Voz</h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Cadastre novos pedidos, clientes e contas apenas falando com nossa IA.</p>
                  </div>
                  {/* Card 2 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Agenda Inteligente</h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Suas entregas organizadas de forma visual e baseadas em prazos urgentes.</p>
                  </div>
                  {/* Card 3 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Fluxo de Caixa</h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Acompanhe seus rendimentos e custos de produção de maneira simples.</p>
                  </div>
                  {/* Card 4 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Orçamentos Precisos</h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Calcule o custo exato do seu tempo e dos insumos de cada projeto.</p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Desenvolvido para ateliês de costura e artesanato.</span>
                  </div>
                  <button 
                    onClick={handleScrollToRecursos}
                    className="hover:underline text-primary font-semibold flex items-center gap-0.5"
                  >
                    Ver detalhes completos &rarr;
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      </div>

      <SubscriptionDrawer profile={null} open={plansOpen} onOpenChange={setPlansOpen} />
    </>
  );
}
