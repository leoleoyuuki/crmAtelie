
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PasswordDialog } from '@/components/password-dialog';

interface PasswordContextType {
  isPrivacyMode: boolean;
  isPasswordSet: boolean;
  togglePrivacyMode: () => void;
  verifyPassword: (password: string) => boolean;
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

export const PasswordProvider = ({ children }: { children: ReactNode }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [passwordHash, setPasswordHash] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // This effect runs only on the client
  useEffect(() => {
    try {
      const storedHash = localStorage.getItem('atelier_password_hash');
      if (storedHash) {
        setPasswordHash(storedHash);
        setIsPasswordSet(true);
      } else {
        setIsPasswordSet(false);
      }
    } catch (error) {
        console.error("Could not access localStorage. Privacy mode will be enforced.");
        // If localStorage is not available, we default to privacy mode on.
        setIsPasswordSet(false);
        setIsPrivacyMode(true);
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
    const hash = simpleHash(password);
    localStorage.setItem('atelier_password_hash', hash);
    setPasswordHash(hash);
    setIsPasswordSet(true);
    setIsPrivacyMode(false); // Unlock after setting password
  };

  const verifyPassword = (password: string): boolean => {
    if (!passwordHash) return false;
    const isCorrect = simpleHash(password) === passwordHash;
    if (isCorrect) {
      setIsPrivacyMode(false);
    }
    return isCorrect;
  };

  const togglePrivacyMode = useCallback(() => {
    if (isPrivacyMode) { // only ask for password if trying to disable privacy
      setIsDialogOpen(true);
    } else {
      setIsPrivacyMode(true);
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
