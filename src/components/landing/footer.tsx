
'use client';
import Logo from '../icons/logo';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-card">
      {/* Crepe Paper Texture Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'url(/images/crepe-paper-muted.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />
      
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">AtelierFlow</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AtelierFlow. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
