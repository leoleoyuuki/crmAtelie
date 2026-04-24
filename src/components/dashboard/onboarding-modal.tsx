
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Smartphone, 
  Printer, 
  MessageSquare, 
  ArrowRight,
  HelpCircle,
  Mic,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useUser } from '@/firebase/auth/use-user';
import { markOnboardingAsSeen } from '@/lib/data';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Transforme seu Ateliê',
    description: 'Menos papelada, mais arte. O AtelierFlow é o seu novo braço direito na gestão de pedidos e clientes.',
    image: '/images/onboarding/welcome.png',
    color: 'bg-primary',
    icon: Sparkles
  },
  {
    id: 'features',
    title: 'Tudo Conectado',
    description: 'Use no PC para impressões térmicas e no celular para gerenciar seu balcão com agilidade.',
    items: [
      { icon: Printer, title: 'Impressão Térmica', desc: 'Comprovantes profissionais em segundos.' },
      { icon: Smartphone, title: 'App no Celular', desc: 'Leve seu ateliê no bolso para onde for.' },
      { icon: MessageSquare, title: 'WhatsApp Direto', desc: 'Notifique seus clientes com um clique.' }
    ],
    color: 'bg-[#C26B42]'
  },
  {
    id: 'ai',
    title: 'Assistente de Voz IA',
    description: 'Cadastre pedidos apenas falando. Nossa inteligência entende o que você diz e organiza tudo para você.',
    image: null, // We'll use a special AI visual here
    isAI: true,
    color: 'bg-[#8B5E3C]'
  },
  {
    id: 'ready',
    title: 'Tudo Pronto!',
    description: 'Você está a um passo de ter o controle total das suas finanças e prazos.',
    items: [
      { icon: CheckCircle2, title: 'Controle de Prazos', desc: 'Nunca mais esqueça uma entrega.' },
      { icon: Zap, title: 'Lucro em Tempo Real', desc: 'Saiba exatamente quanto está ganhando.' }
    ],
    color: 'bg-[#7D8471]'
  }
];

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);

  const handleFinish = async () => {
    if (user) {
      await markOnboardingAsSeen(user.uid);
    }
    localStorage.setItem('atelierflow_onboarding_seen', 'true');
    onOpenChange(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "5511921494313";
    const message = "Olá! Acabei de entrar no AtelierFlow e gostaria de tirar uma dúvida.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 overflow-hidden border-none bg-background shadow-2xl rounded-[2.5rem]">
        <div className="flex h-full w-full flex-col lg:flex-row">
          
          {/* Left Side: Visuals (Hidden on mobile if needed, but keeping it for premium feel) */}
          <div className={cn("relative hidden lg:flex lg:w-1/2 h-full items-center justify-center transition-colors duration-700", step.color)}>
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <Logo className="absolute -top-12 -left-12 h-64 w-64 fill-white rotate-12" />
                <Logo className="absolute -bottom-12 -right-12 h-96 w-96 fill-white -rotate-12" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full h-full flex items-center justify-center p-12"
              >
                {step.isAI ? (
                  <div className="flex flex-col items-center gap-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
                      <div className="relative h-48 w-48 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                        <Mic className="h-20 w-20 text-white animate-bounce" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-1.5 h-8 bg-white/40 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                ) : step.image ? (
                  <div className="relative w-full h-full max-h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                    <Image 
                      src={step.image} 
                      alt={step.title} 
                      fill 
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full max-w-sm">
                    {step.items?.map((item, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 transition-all hover:bg-white/20">
                        <div className="bg-white/20 p-3 rounded-xl">
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-bold text-base leading-tight">{item.title}</h4>
                          <p className="text-white/60 text-xs leading-tight mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Content */}
          <div className="flex-1 h-full flex flex-col bg-white dark:bg-zinc-950 p-8 lg:p-16 relative">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-headline font-black text-xl tracking-tighter">AtelierFlow</span>
              </div>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-muted"
                    )} 
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-headline font-black tracking-tight leading-tight">
                      {step.title}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {step.items && (
                    <div className="space-y-3 pt-2">
                      {step.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-muted bg-muted/5 hover:bg-muted/10 transition-colors">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-[13px] leading-tight">{item.title}</h4>
                            <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.id === 'welcome' && (
                    <div className="pt-8 flex items-center gap-4 text-sm font-medium text-muted-foreground italic border-t border-muted">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        "O sistema que entende o coração do seu ateliê."
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex items-center justify-between">
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={prevStep}
                    className="h-12 px-6 rounded-2xl font-bold gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleWhatsAppClick}
                  className="hidden sm:flex h-12 px-6 rounded-2xl font-bold gap-2 border-muted hover:bg-muted/50"
                >
                  <HelpCircle className="h-4 w-4" />
                  Suporte
                </Button>
              </div>

              <Button 
                onClick={nextStep}
                className="h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {currentStep === steps.length - 1 ? 'Começar Agora' : 'Próximo'}
                {currentStep === steps.length - 1 ? <CheckCircle2 className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx global>{`
        @keyframes wave {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}
