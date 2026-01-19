'use client';
import Link from 'next/link';
import { Button } from '../ui/button';
import Logo from '../icons/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            AtelierFlow
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Acessar o Sistema</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Organizar meu ateliê</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
