
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Eye } from 'lucide-react';
import Logo from '@/components/icons/logo';

export function WelcomeGuide() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('atelierflow_welcome_guide_dismissed') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('atelierflow_welcome_guide_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="relative bg-primary p-0 border-none shadow-xl overflow-hidden rounded-2xl mb-8">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 pointer-events-none">
            <Logo className="h-32 w-32 fill-white" />
        </div>

        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shrink-0">
                    <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-headline font-bold text-white mb-1">
                        Descubra o novo Dashboard do AtelierFlow
                    </h3>
                    <p className="text-white/80 text-sm max-w-xl">
                        Centralizamos tudo o que é importante para o seu ateliê. Veja seus pedidos, prazos e finanças com uma nova perspectiva.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <Button 
                    className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl px-6 h-12 shadow-lg"
                    onClick={handleDismiss}
                >
                    Explorar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 h-12 w-12 rounded-xl"
                    onClick={handleDismiss}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
