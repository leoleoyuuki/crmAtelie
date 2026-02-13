
'use client';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';

export default function LoginPage() {
  const { auth } = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google: ', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center space-y-6 px-4">
        <div className="flex items-center gap-2 text-center">
            <Logo className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-headline font-bold text-primary">
            Bem-vindo ao AtelierFlow
          </h1>
          <p className="mt-2 text-muted-foreground">
            Faça login para continuar e gerenciar seu ateliê.
          </p>
        </div>
        <div className="w-full">
            <Button onClick={handleGoogleSignIn} className="w-full h-12 text-base shadow-md">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 266.1 0 129.9 109.8 20 244 20c74.3 0 134.3 29.3 178.6 71.7l-62.8 62.1C337 114.6 296.3 95.3 244 95.3c-82.6 0-149.3 67.5-149.3 170.8 0 103.2 66.7 170.8 149.3 170.8 98.2 0 129.2-74.4 132.8-112.4H244v-81.4h238.2c2.6 14.7 4.2 30.8 4.2 47.4z"></path></svg>
                Entrar com Google
            </Button>
        </div>
      </div>
    </div>
  );
}
