'use client';

import { Button } from "@/components/ui/button";
import { Hammer, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/icons/logo";

export default function ImplementandoPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8">
      <div className="bg-primary/10 p-6 rounded-full relative">
        <Hammer className="h-16 w-16 text-primary animate-bounce" />
        <Sparkles className="h-6 w-6 text-yellow-500 absolute top-2 right-2 animate-pulse" />
      </div>
      
      <div className="space-y-4 max-w-lg">
        <h1 className="text-4xl font-black font-headline tracking-tight text-foreground">
          Estamos costurando essa novidade! 🧵
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Esta funcionalidade está em fase de acabamento e em breve estará disponível para deixar o seu ateliê ainda mais profissional.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" size="lg" className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para onde eu estava
        </Button>
        <Button asChild size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20">
          <Link href="/">Ir para o Dashboard</Link>
        </Button>
      </div>

      <div className="pt-12 opacity-20 grayscale flex items-center gap-2">
        <Logo className="h-6 w-6" />
        <span className="font-headline font-bold">AtelierFlow</span>
      </div>
    </div>
  );
}
