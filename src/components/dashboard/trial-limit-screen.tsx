import React from "react";
import { Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrialLimitScreenProps {
    type: 'customers' | 'orders';
    onClose: () => void;
}

export function TrialLimitScreen({ type, onClose }: TrialLimitScreenProps) {
    const title = type === 'customers' ? 'Limite de Clientes Atingido' : 'Limite de Pedidos Atingido';
    const limit = type === 'customers' ? 5 : 15;
    
    const handleUpgrade = () => {
        window.dispatchEvent(new CustomEvent('open-subscription-drawer'));
        onClose();
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10">
                <Crown className="h-12 w-12 text-primary drop-shadow-md" />
            </div>
            
            <div className="space-y-3">
                <h2 className="text-3xl font-headline font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {title}
                </h2>
                <p className="text-base text-muted-foreground w-full max-w-sm mx-auto leading-relaxed">
                    Você atingiu o limite gratuito de <strong className="text-foreground">{limit} {type === 'customers' ? 'clientes' : 'pedidos'}</strong>.
                    <br/><br/>
                    Seu ateliê está crescendo! Faça o upgrade para o plano Premium e libere cadastros ilimitados, além de todos os recursos exclusivos.
                </p>
            </div>

            <Button 
                onClick={handleUpgrade}
                className="w-full max-w-sm h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-primary-foreground group"
            >
                <Sparkles className="mr-2 h-5 w-5" />
                Desbloquear Acesso Ilimitado
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="ghost" className="text-sm font-bold text-muted-foreground mt-2" onClick={onClose}>
                Agora não
            </Button>
        </div>
    );
}
