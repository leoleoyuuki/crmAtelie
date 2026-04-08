"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useDocument } from "@/firebase";
import { auth } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ShieldCheck, Zap, Sparkles, User as UserIcon, Key, Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { SubscriptionDrawer } from "@/components/subscription-drawer";
import { isValid } from "date-fns";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function SettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const [isPortalLoading, setIsPortalLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { data: profile } = useDocument<UserProfile>(user ? `users/${user.uid}` : null);

    const isTrial = profile?.trialExpiresAt && isValid(profile.trialExpiresAt) && new Date() <= profile.trialExpiresAt;
    const hasPaidSubscription = !!profile?.stripeSubscriptionId;
    const isActivePaid = profile?.status === 'active' && hasPaidSubscription;

    // Profile States
    const [newName, setNewName] = useState("");
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    
    // Password States
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setNewName(user.displayName);
        }
    }, [user]);

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

    const handleUpdateName = async () => {
        if (!auth.currentUser || !newName.trim() || newName === user?.displayName) return;
        
        setIsUpdatingName(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: newName.trim()
            });
            toast({
                title: "Nome atualizado",
                description: "Seu nome foi atualizado com sucesso.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar nome",
                description: error.message || "Tente novamente em instantes."
            });
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!auth.currentUser || !newPassword || !currentPassword) {
            toast({
                variant: "destructive",
                title: "Campos obrigatórios",
                description: "Por favor, preencha sua senha atual e a nova senha.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Senhas divergentes",
                description: "A confirmação da nova senha está diferente.",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                variant: "destructive",
                title: "Senha muito curta",
                description: "A senha deve ter pelo menos 6 caracteres.",
            });
            return;
        }
        
        setIsUpdatingPassword(true);
        try {
            if (user?.email) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(auth.currentUser, credential);
            }

            await updatePassword(auth.currentUser, newPassword);
            toast({
                title: "Senha atualizada",
                description: "Sua senha foi alterada com sucesso.",
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            let errorMsg = "Tente novamente em instantes.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMsg = "Sua senha atual está incorreta.";
            } else if (error.code === 'auth/requires-recent-login') {
                errorMsg = "Por segurança, faça logout e login novamente para alterar a senha.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg = "Muitas tentativas falhas. Tente novamente mais tarde.";
            }
            toast({
                variant: "destructive",
                title: "Erro ao atualizar senha",
                description: errorMsg,
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="container max-w-4xl py-10 px-4 md:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary mb-2">Configurações</h1>
                <p className="text-muted-foreground text-sm">Gerencie sua conta e preferências do sistema.</p>
            </div>

            <div className="grid gap-6">
                
                {/* ── PROFILE CONFIGURATION ─────────────────────────── */}
                <Card className="border-border shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Meu Perfil</CardTitle>
                                <CardDescription>Atualize seu nome e senha de acesso.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-8">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome de Exibição</Label>
                                <Input 
                                    id="name" 
                                    placeholder="Seu nome" 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    onClick={handleUpdateName} 
                                    disabled={isUpdatingName || !newName.trim() || newName === user?.displayName}
                                    className="font-bold w-full md:w-auto"
                                >
                                    {isUpdatingName ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Atualizar Nome
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-8 grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Senha Atual</Label>
                                    <Input 
                                        id="current-password" 
                                        type="password"
                                        placeholder="Sua senha atual" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nova Senha</Label>
                                    <div className="relative">
                                        <Input 
                                            id="new-password" 
                                            type="password"
                                            placeholder="Mínimo 6 caracteres" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                    <Input 
                                        id="confirm-password" 
                                        type="password"
                                        placeholder="Repita a nova senha" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    variant="outline"
                                    onClick={handleUpdatePassword} 
                                    disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                                    className="font-bold w-full md:w-auto"
                                >
                                    {isUpdatingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                                    Alterar Senha
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── BILLING & SUBSCRIPTION ─────────────────────────── */}
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
                                    {isActivePaid ? (
                                        <span className="text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                            <ShieldCheck className="h-3 w-3" /> Ativa
                                        </span>
                                    ) : isTrial ? (
                                        <span className="text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                                            <Sparkles className="h-3 w-3" /> Teste Grátis
                                        </span>
                                    ) : (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">Inativa</span>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isActivePaid 
                                        ? "Sua assinatura está sendo gerenciada via Stripe." 
                                        : isTrial 
                                            ? "Você está no período de teste gratuito do AtelierFlow Pro."
                                            : "Você não possui uma assinatura ativa no momento."}
                                </p>
                            </div>
                            
                            {isActivePaid ? (
                                <Button 
                                    onClick={handleManageSubscription} 
                                    disabled={isPortalLoading}
                                    className="w-full md:w-auto font-bold rounded-xl"
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    {isPortalLoading ? "Carregando..." : "Gerenciar no Stripe"}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={() => setIsDrawerOpen(true)}
                                    className="w-full md:w-auto font-bold rounded-xl"
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    {isTrial ? "Assinar Agora" : "Ver Planos"}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
            <SubscriptionDrawer 
                profile={profile} 
                open={isDrawerOpen} 
                onOpenChange={setIsDrawerOpen} 
            />
        </div>
    );
}
