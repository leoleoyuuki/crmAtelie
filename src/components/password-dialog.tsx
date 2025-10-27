
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
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSettingNewPassword(!isPasswordSet);
    }
  }, [isOpen, isPasswordSet]);

  const handleVerify = () => {
    if (verifyPassword(passwordInput)) {
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
            <DialogTitle>Configurar Senha de Visualização</DialogTitle>
            <DialogDescription>
              Esta será a senha usada para mostrar dados financeiros. Guarde-a em um local seguro. Se perdida, não poderá ser recuperada.
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
             <Button variant="outline" size="sm" onClick={handleGeneratePassword}>Gerar Senha Segura</Button>
          </div>
          <DialogFooter>
            <Button onClick={handleSetPassword}>Salvar Senha</Button>
          </DialogFooter>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Digite a Senha</DialogTitle>
          <DialogDescription>
            Para visualizar os dados financeiros, por favor, insira a senha de acesso.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password-input" className="text-right">
              Senha
            </Label>
            <Input
              id="password-input"
              type="password"
              className="col-span-3"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>
        </div>
        <DialogFooter>
            <a onClick={() => setIsSettingNewPassword(true)} className="text-sm text-muted-foreground hover:underline cursor-pointer mr-auto">Esqueceu ou quer redefinir a senha?</a>
            <Button onClick={handleVerify}>Desbloquear</Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
