'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { useFirebase } from '@/firebase';
import { Loader2, Phone, Star, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfilePhone } from '@/lib/data';
import { Label } from '@/components/ui/label';
import type { UserProfile } from '@/lib/types';
import { notifyPhoneCollectedAction } from '@/app/actions/notifications';

interface PhoneRequiredScreenProps {
    profile: UserProfile | null;
}

export default function PhoneRequiredScreen({ profile }: PhoneRequiredScreenProps) {
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { auth } = useFirebase();
    const user = auth.currentUser;

    const handleSubmit = async () => {
        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
            toast({ variant: 'destructive', title: 'Número Inválido', description: 'Por favor, informe seu número de WhatsApp completo com DDD.' });
            return;
        }

        if (!user) return;

        setIsLoading(true);
        try {
            await updateUserProfilePhone(user.uid, phone);
            
            // Notificar Discord
            await notifyPhoneCollectedAction({
                name: profile?.displayName || user.displayName || 'Usuário',
                email: profile?.email || user.email || 'N/A',
                phone: phone
            });

            toast({ title: 'Sucesso!', description: 'Seu perfil foi atualizado. Bem-vindo(a)!' });
            // O AuthWrapper deve detectar a mudança e liberar o acesso
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível salvar seu telefone.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F5F5F3] relative overflow-hidden items-center justify-center p-4">
            {/* DECORATIVE GRADIENTS */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10 space-y-6">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-headline font-bold text-xl text-foreground">AtelierFlow</span>
                </div>

                <Card className="border-primary/20 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Phone className="h-7 w-7 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Só mais um passo!</CardTitle>
                        <CardDescription className="text-base">
                            Informe seu WhatsApp para mantermos contato e liberar seu acesso ao sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-bold text-muted-foreground">WhatsApp (com DDD)</Label>
                            <Input 
                                id="phone"
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                                className="text-lg py-6 bg-white border-primary/10 rounded-xl focus:ring-primary/20"
                            />
                        </div>
                        
                        <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Utilizamos seu contato apenas para suporte importante e atualizações do sistema. Não enviamos spam.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="pb-8">
                        <Button 
                            onClick={handleSubmit} 
                            className="w-full text-lg py-7 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Liberar meu Acesso"}
                        </Button>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Ao continuar, você concorda com nossos termos de uso.
                </p>
            </div>
        </div>
    )
}
