"use client";

import React from "react";
import { Sparkles, Crown, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialLimitScreenProps {
    type: 'customers' | 'orders';
    onClose: () => void;
}

export function TrialLimitScreen({ type, onClose }: TrialLimitScreenProps) {
    const isCustomers = type === 'customers';
    const title = isCustomers ? 'Limite de Clientes' : 'Limite de Pedidos';
    const limit = isCustomers ? 5 : 15;
    const noun = isCustomers ? 'clientes' : 'pedidos';

    const handleUpgrade = () => {
        window.dispatchEvent(new CustomEvent('open-subscription-drawer'));
        onClose();
    };

    return (
        // This div fills the entire DialogContent area and IS the glass surface
        <div className="relative flex flex-col items-center justify-center min-h-[480px] p-8 text-center overflow-hidden rounded-[inherit]"
            style={{
                background: 'radial-gradient(ellipse at top left, hsl(var(--primary) / 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom right, hsl(var(--primary) / 0.12) 0%, transparent 60%)',
            }}
        >
            {/* Ambient blobs */}
            <div className="absolute -top-12 -left-12 h-56 w-56 rounded-full bg-primary/25 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse [animation-delay:1.5s]" />

            {/* Subtle grid overlay for depth */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 0h1v20H0zM19 0h1v20h-1zM0 0h20v1H0zM0 19h20v1H0z\' fill=\'%23000\'/%3E%3C/svg%3E")' }}
            />

            {/* Content – sits directly on the glassmorphic background */}
            <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-xs mx-auto">
                {/* Icon */}
                <div className="relative">
                    <div className="absolute inset-0 scale-150 rounded-full bg-primary/30 blur-2xl" />
                    <div className="relative h-24 w-24 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-primary/20">
                        <Crown className="h-11 w-11 text-primary drop-shadow-lg" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-destructive border-2 border-background flex items-center justify-center shadow-lg">
                        <Lock className="h-3.5 w-3.5 text-white" />
                    </div>
                </div>

                {/* Atingido badge */}
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    Plano Gratuito · Limite Atingido
                </span>

                {/* Title & body */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-headline font-black bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent leading-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Você usou os <span className="font-bold text-foreground">{limit} {noun}</span>{" "}
                        disponíveis no plano gratuito. Faça o upgrade e libere{" "}
                        <span className="font-bold text-primary">cadastros ilimitados</span> e muito mais. 🚀
                    </p>
                </div>

                {/* Gradient separator */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                {/* CTA */}
                <Button
                    onClick={handleUpgrade}
                    className="w-full h-12 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 group transition-all hover:scale-[1.02] hover:shadow-primary/40"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Desbloquear Acesso Ilimitado
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <button
                    onClick={onClose}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Agora não
                </button>
            </div>
        </div>
    );
}
