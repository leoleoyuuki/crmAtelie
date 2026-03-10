'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PasswordDialog } from '@/components/password-dialog';
import { useUser, useDocument } from '@/firebase';
import { setUserPrivacyPassword } from '@/lib/data';
import type { UserProfile } from '@/lib/types';

interface PasswordContextType {
  isPrivacyMode: boolean;
  isPasswordSet: boolean;
  togglePrivacyMode: () => void;
  verifyPassword: (password: string, shouldPersist?: boolean) => boolean;
  setPassword: (password: string) => void;
  generateAndCopyPassword: () => string;
}

export const PasswordContext = createContext<PasswordContextType>({
  isPrivacyMode: true,
  isPasswordSet: false,
  togglePrivacyMode: () => {},
  verifyPassword: () => false,
  setPassword: () => {},
  generateAndCopyPassword: () => '',
});

const PERSIST_KEY = 'atelierflow_privacy_persist_unlocked';

export const PasswordProvider = ({ children }: { children: ReactNode }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { user } = useUser();
  const { data: profile } = useDocument<UserProfile>(user ? `users/${user.uid}` : null);
  
  const isPasswordSet = !!profile?.passwordHash;
  const passwordHash = profile?.passwordHash || null;

  // Verifica persistência no carregamento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAlwaysUnlocked = localStorage.getItem(PERSIST_KEY) === 'true';
      if (isAlwaysUnlocked) {
        setIsPrivacyMode(false);
      }
    }
  }, []);

  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  };

  const setPassword = (password: string) => {
    if (!user) return;
    const hash = simpleHash(password);
    setUserPrivacyPassword(user.uid, hash)
      .then(() => {
        setIsPrivacyMode(false); // Unlock after setting password
      })
      .catch((error) => {
        console.error("Failed to set privacy password:", error);
      });
  };

  const verifyPassword = (password: string, shouldPersist: boolean = false): boolean => {
    if (!passwordHash) return false;
    const isCorrect = simpleHash(password) === passwordHash;
    if (isCorrect) {
      setIsPrivacyMode(false);
      if (shouldPersist) {
        localStorage.setItem(PERSIST_KEY, 'true');
      } else {
        localStorage.removeItem(PERSIST_KEY);
      }
    }
    return isCorrect;
  };

  const togglePrivacyMode = useCallback(() => {
    if (isPrivacyMode) { // only ask for password if trying to disable privacy
      setIsDialogOpen(true);
    } else {
      setIsPrivacyMode(true);
      // Se o usuário trancar manualmente, não alteramos a persistência para a próxima sessão, 
      // mas mantemos trancado nesta sessão.
    }
  }, [isPrivacyMode]);

  const generateAndCopyPassword = () => {
    const newPass = Math.random().toString(36).slice(-10);
    navigator.clipboard.writeText(newPass);
    return newPass;
  };

  return (
    <PasswordContext.Provider
      value={{
        isPrivacyMode,
        isPasswordSet,
        togglePrivacyMode,
        verifyPassword,
        setPassword,
        generateAndCopyPassword
      }}
    >
      {children}
      <PasswordDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </PasswordContext.Provider>
  );
};
