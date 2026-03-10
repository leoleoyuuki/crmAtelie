'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState, useContext, useEffect } from 'react';
import { PasswordContext } from '@/contexts/password-context';

interface PasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordDialog({ isOpen, onOpenChange }: PasswordDialogProps) {
  const { isPasswordSet, verifyPassword, setPassword, generateAndCopyPassword } = useContext(PasswordContext);
  const { toast } = useToast();
  const [passwordInput, setPasswordInput] = useState('');
  const [shouldPersist, setShouldPersist] = useState(false);
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setShouldPersist(false);
      setIsSettingNewPassword(!isPasswordSet);
    }
  }, [isOpen, isPasswordSet]);

  const handleVerify = () => {
    if (verifyPassword(passwordInput, shouldPersist)) {
      toast({ title: 'Acesso liberado!', description: 'O modo de privacidade foi desativado.' });
      onOpenChange(false);
    } else {
      toast({ variant: 'destructive', title: 'Senha Incorreta', description: 'A senha digitada está incorreta.' });
    }
  };

  const handleSetPassword = () => {
    if (newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.' });
        return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'As senhas não coincidem', description: 'Por favor, verifique a confirmação da senha.' });
      return;
    }
    setPassword(newPassword);
    toast({ title: 'Senha definida com sucesso!', description: 'Você já pode desativar o modo de privacidade.' });
    onOpenChange(false);
  };
  
  const handleGeneratePassword = () => {
    const generatedPassword = generateAndCopyPassword();
    setNewPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    toast({ title: 'Senha gerada e copiada!', description: 'Cole a senha nos campos abaixo e guarde-a em um local seguro.' });
  }

  const renderContent = () => {
    if (isSettingNewPassword) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Configurar Senha</DialogTitle>
            <DialogDescription>
              Esta senha protege seus dados financeiros. Guarde-a em um local seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12"
              />
            </div>
             <Button variant="outline" size="sm" onClick={handleGeneratePassword} className="w-full">Gerar Senha Segura</Button>
          </div>
          <DialogFooter>
            <Button onClick={handleSetPassword} className="w-full h-12 font-bold">Salvar Senha</Button>
          </DialogFooter>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Digite a Senha</DialogTitle>
          <DialogDescription>
            Para visualizar os dados financeiros, por favor, insira a senha de acesso.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="password-input">Senha de Acesso</Label>
            <Input
              id="password-input"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="h-12"
              autoFocus
            />
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl bg-muted/30 border border-dashed">
            <Checkbox 
                id="persist" 
                checked={shouldPersist} 
                onCheckedChange={(checked) => setShouldPersist(checked as boolean)}
                className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
                <label
                    htmlFor="persist"
                    className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    Sempre abrir sem privacidade
                </label>
                <p className="text-xs text-muted-foreground">
                    O app não pedirá senha nas próximas vezes que você abrir este navegador.
                </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-4">
            <Button onClick={handleVerify} className="w-full h-12 font-bold shadow-lg">Desbloquear Dados</Button>
            <button 
                onClick={() => setIsSettingNewPassword(true)} 
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
                Esqueceu ou quer redefinir a senha?
            </button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
