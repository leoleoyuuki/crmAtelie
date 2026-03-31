"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useDocument } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";
import type { UserProfile } from "@/lib/types";

export default function SettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const { data: profile } = useDocument<UserProfile>(user ? `users/${user.uid}` : null);

    const handleManageSubscription = async () => {
        if (!user || isPortalLoading) return;
        
        setIsPortalLoading(true);
        try {
            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast({ 
                    variant: "destructive", 
                    title: "Erro ao abrir portal", 
                    description: data.error || "Não foi possível carregar o portal da Stripe." 
                });
            }
        } catch (error) {
            toast({ 
                variant: "destructive", 
                title: "Erro de conexão", 
                description: "Tente novamente em instantes." 
            });
        } finally {
            setIsPortalLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl py-10 px-4 md:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary mb-2">Configurações</h1>
                <p className="text-muted-foreground text-sm">Gerencie sua conta e preferências do sistema.</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-primary/10 shadow-lg shadow-primary/5 overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Assinatura e Faturamento</CardTitle>
                                <CardDescription>Gerencie seu plano, métodos de pagamento e faturas.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-bold flex items-center gap-2">
                                    Status: 
                                    {profile?.status === 'active' ? (
                                        <span className="text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                            <ShieldCheck className="h-3 w-3" /> Ativa
                                        </span>
                                    ) : (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">Inativa</span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {profile?.status === 'active' 
                                        ? "Sua assinatura está sendo gerenciada via Stripe." 
                                        : "Você não possui uma assinatura ativa no momento."}
                                </p>
                            </div>
                            
                            {profile?.stripeCustomerId ? (
                                <Button 
                                    onClick={handleManageSubscription} 
                                    disabled={isPortalLoading}
                                    className="w-full md:w-auto font-bold rounded-xl"
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    {isPortalLoading ? "Carregando..." : "Gerenciar no Stripe"}
                                </Button>
                            ) : (
                                <Button variant="outline" asChild className="w-full md:w-auto font-bold rounded-xl">
                                    <a href="/ativacao">Ver Planos</a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder para futuras configurações */}
                <Card className="border-border/50 bg-muted/20 border-dashed">
                    <CardContent className="py-10 text-center">
                        <p className="text-sm text-muted-foreground italic">Novas configurações serão adicionadas em breve...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
