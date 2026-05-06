"use client"
import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Logo from '@/components/icons/logo';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">

      {/* ── FULL-BLEED BACKGROUND IMAGE ───────────────────── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/seamstress-404.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Warm gradient veil over the image for legibility */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(
              to bottom,
              hsla(20, 12%, 5%, 0.30) 0%,
              hsla(20, 12%, 5%, 0.15) 30%,
              hsla(47, 22%, 15%, 0.55) 70%,
              hsla(20, 12%, 5%, 0.85) 100%
            )
          `,
        }}
      />

      {/* ── HEADER ────────────────────────────────────────── */}
      <header className="relative z-10 w-full">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="h-7 w-7 text-white/90 group-hover:text-white transition-colors" />
            <span className="text-lg font-bold font-headline text-white/90 group-hover:text-white transition-colors">
              AtelierFlow
            </span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-end justify-start pb-16 md:pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-xl w-full">

          {/* Glass content card */}
          <div
            className="rounded-3xl p-8 md:p-10"
            style={{
              background: 'hsla(47, 22%, 97%, 0.10)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid hsla(47, 22%, 100%, 0.18)',
              boxShadow: '0 8px 40px -8px rgba(0,0,0,0.40), inset 0 1px 0 hsla(47,22%,100%,0.25)',
            }}
          >
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80"
              style={{ background: 'hsla(47,22%,100%,0.12)', border: '1px solid hsla(47,22%,100%,0.20)' }}
            >
              <Search className="w-2.5 h-2.5" />
              Página não encontrada
            </span>

            {/* 404 */}
            <div className="mt-5 select-none leading-none">
              <span
                className="text-[7rem] md:text-[9rem] font-black font-headline tracking-tighter leading-none"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, hsl(19 52% 75%) 55%, hsl(85 14% 65%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
                }}
              >
                404
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-2 text-2xl md:text-3xl font-bold font-headline text-white leading-tight"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
            >
              Ops! Essa página sumiu<br />
              <span className="text-primary italic" style={{ color: 'hsl(19 72% 75%)' }}>
                como linha no ateliê
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-[44ch]">
              Nossa costureira vasculhou o ateliê inteiro com a lupa, mas não conseguiu encontrar essa página.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                style={{ background: 'hsl(47 22% 95%)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
              >
                <Home className="w-4 h-4" />
                Ir para o início
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: 'hsla(47,22%,100%,0.12)',
                  border: '1px solid hsla(47,22%,100%,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Acessar o sistema
              </Link>
            </div>
          </div>

          {/* Caption below card */}
          <p className="mt-5 text-center text-xs text-white/35 tracking-wider">
            © {new Date().getFullYear()} AtelierFlow · Todos os direitos reservados
          </p>
        </div>
      </main>
    </div>
  );
}
