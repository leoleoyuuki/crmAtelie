'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import Logo from '../icons/logo';
import { trackFbqEvent } from '@/lib/fpixel';
import { motion } from 'framer-motion';
import { SubscriptionDrawer } from '../subscription-drawer';

export function Header() {
  const [plansOpen, setPlansOpen] = useState(false);

  const handleLeadClick = () => {
    trackFbqEvent('Lead');
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full border-b border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/40 dark:bg-zinc-950/40 backdrop-blur-md relative overflow-hidden"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Logo className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-xl font-bold font-headline text-foreground group-hover:text-primary transition-colors">
              AtelierFlow
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="hover:bg-primary/10 transition-colors"
              onClick={() => setPlansOpen(true)}
            >
              Planos
            </Button>
            <Button
              variant="ghost"
              asChild
              className="hidden sm:inline-flex hover:bg-primary/10 transition-colors"
              onClick={handleLeadClick}
            >
              <Link href="/login">Acessar o Sistema</Link>
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild onClick={handleLeadClick} className="shadow-lg shadow-primary/20">
                <Link href="/login?mode=signup">Testar 7 dias grátis</Link>
              </Button>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      <SubscriptionDrawer profile={null} open={plansOpen} onOpenChange={setPlansOpen} />
    </>
  );
}
