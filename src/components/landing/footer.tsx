'use client';
import Link from 'next/link';
import Logo from '../icons/logo';
import { Instagram, MessageCircle, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-secondary/80 text-white/80 border-t border-emerald-500/30">
      
      {/* Decorative Blur Spheres for visual depth */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-orange-400/20 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="container relative z-10 mx-auto px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Column 1: Logo & Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Logo className="h-8 w-8 text-orange-200" />
              <span className="text-xl font-bold font-headline tracking-tight">AtelierFlow</span>
            </div>
            <div className="space-y-1 text-sm text-white/70">
              <p>Profissionalizando a costura e o artesanato.</p>
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-200">Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <a href="#recursos" className="text-white/80 hover:text-white transition-colors">Recursos</a>
              </li>
              <li>
                <Link href="/login" className="text-white/80 hover:text-white transition-colors">Acessar</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-200">Contato</h4>
            <div className="space-y-2 text-sm text-white/80">
              <p className="flex items-center gap-2">
                <span className="text-orange-200/80 font-medium">WhatsApp:</span> (11) 92149-4313
              </p>
              <p className="flex items-center gap-2">
                <span className="text-orange-200/80 font-medium">Instagram:</span> @atelierflow.app
              </p>
              <p className="flex items-center gap-2">
                <span className="text-orange-200/80 font-medium">Email:</span> oi@atelierflow.com.br
              </p>
            </div>
          </div>

          {/* Column 4: Social Networks */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-200">Redes Sociais</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/5511921494313"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/atelierflow.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:oi@atelierflow.com.br"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/60 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Line & Copyright */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-white/50">
          <p>© {new Date().getFullYear()} AtelierFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
