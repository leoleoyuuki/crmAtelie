
'use client';
import Logo from '../icons/logo';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row md:px-6">
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
