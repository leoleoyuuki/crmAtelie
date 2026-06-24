'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Star, Heart, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/icons/logo';
import { useUser } from '@/firebase/auth/use-user';
import Image from 'next/image';
import { trackFbqEvent } from '@/lib/fpixel';

export default function SucessoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { user } = useUser();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            router.push('/ativacao');
            return;
        }

        // Evitar disparos duplicados se o usuário recarregar a página
        const trackingKey = `tracked_session_${sessionId}`;
        const alreadyTracked = sessionStorage.getItem(trackingKey);

        if (!alreadyTracked) {
            let utmData = {};
            try {
                const savedUtms = sessionStorage.getItem('atelierflow_utm_params');
                if (savedUtms) {
                    utmData = JSON.parse(savedUtms);
                }
            } catch (err) {
                console.error('Erro ao recuperar UTMs na página de sucesso:', err);
            }

            // Envia o Início do Trial (StartTrial)
            trackFbqEvent('StartTrial', {
                content_name: 'Trial Ativado',
                value: 0.00,
                currency: 'BRL',
                ...utmData
            });

            sessionStorage.setItem(trackingKey, 'true');
        }
    }, [sessionId, router]);

    const handleDashboardGo = () => {
        setIsRedirecting(true);
        setTimeout(() => {
            router.push('/');
        }, 1200);
    };

    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-slate-50">
            {/* Background Image: Full Immersive */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/atelier_success_light_bg.png" 
                    alt="Success Background" 
                    fill 
                    className="object-cover"
                    priority
                />
            </div>
            
            {/* Overlays for depth and readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/60 z-0" />
            <div className="absolute inset-0 backdrop-blur-[2px] z-0" />
            
            {/* Floating Sparkles (Inspired by Login) */}
            <div className="absolute inset-0 pointer-events-none z-1">
                <motion.div
                    animate={{ 
                        y: [0, -15, 0],
                        opacity: [0.2, 0.5, 0.2] 
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4"
                >
                    <Sparkles className="h-8 w-8 text-primary/30" />
                </motion.div>
                <motion.div
                    animate={{ 
                        y: [0, 15, 0],
                        opacity: [0.1, 0.4, 0.1] 
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4"
                >
                    <Sparkles className="h-10 w-10 text-primary/20" />
                </motion.div>
            </div>
  
            <main className="relative z-10 w-full max-w-xl px-4 py-4 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-4 lg:mb-6"
                >
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 lg:px-6 py-2 rounded-2xl border border-white/30 shadow-xl">
                        <div className="bg-white p-1 rounded-lg">
                            <Logo className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-headline font-black text-lg lg:text-xl text-slate-900 tracking-tighter">AtelierFlow</span>
                    </div>
                </motion.div>
  
                <Card className="w-full bg-white/25 backdrop-blur-2xl border-white/40 shadow-[0_32px_120px_-12px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-6 lg:p-10 text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
                            className="bg-primary h-20 w-20 lg:h-24 lg:w-24 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_15px_40px_rgba(var(--primary),0.3)] relative group"
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] animate-pulse group-hover:scale-110 transition-transform" />
                            <CheckCircle2 className="h-10 w-10 lg:h-12 lg:w-12 text-white stroke-[2.5px] relative z-10" />
                        </motion.div>
  
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 font-headline tracking-tightest leading-none mb-4">
                                Sucesso Total! <br/>
                                <span className="text-primary italic underline decoration-white/50 text-2xl lg:text-4xl">Assinatura Ativa.</span>
                            </h1>
                        </motion.div>
  
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-slate-800 font-medium text-base lg:text-lg mb-8 max-w-sm mx-auto leading-tight"
                        >
                            Obrigado por confiar no AtelierFlow. Seu <span className="font-bold">Plano Mensal</span> já está liberado.
                        </motion.p>
  
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
                        >
                            <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/40 flex items-center gap-3 text-left group hover:bg-white/40 transition-colors">
                                <div className="bg-primary p-2 rounded-xl shadow-md ring-2 ring-white/20">
                                    <Star className="h-4 w-4 text-white fill-current" />
                                </div>
                                <div>
                                    <p className="text-[8px] text-primary font-black uppercase tracking-widest">Premium</p>
                                    <p className="text-sm text-slate-900 font-bold leading-tight">Acesso Ilimitado</p>
                                </div>
                            </div>
                            <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/40 flex items-center gap-3 text-left group hover:bg-white/40 transition-colors">
                                <div className="bg-primary p-2 rounded-xl shadow-md ring-2 ring-white/20">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[8px] text-primary font-black uppercase tracking-widest">Exclusivo</p>
                                    <p className="text-sm text-slate-900 font-bold leading-tight">Suporte Prioritário</p>
                                </div>
                            </div>
                        </motion.div>
  
                        <AnimatePresence mode="wait">
                            {!isRedirecting ? (
                                <motion.div
                                    key="button"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Button
                                        onClick={handleDashboardGo}
                                        size="lg"
                                        className="w-full h-16 lg:h-20 rounded-2xl text-xl lg:text-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            Entrar no Sistema
                                            <ArrowRight className="ml-2 h-6 w-6 lg:h-8 lg:w-8 group-hover:translate-x-2 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center py-2"
                                >
                                    <Loader2 className="h-10 w-10 lg:h-12 lg:w-12 text-primary animate-spin mb-2" />
                                    <p className="text-slate-900 font-black text-sm lg:text-base animate-pulse tracking-tight">Personalizando seu ateliê...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
  
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 lg:mt-8"
                >
                    <button className="bg-white/20 backdrop-blur-xl px-4 lg:px-6 py-2 rounded-full border border-white/30 text-slate-900 font-bold text-xs shadow-lg hover:bg-primary hover:text-white transition-all">
                        Dúvidas? Fale com nosso suporte
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
