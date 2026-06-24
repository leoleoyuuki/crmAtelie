
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, getAdditionalUserInfo } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { trackFbqEvent } from '@/lib/fpixel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Logo from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Clock, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Prazos Sob Controle',
    description: 'Painel inteligente que prioriza o que é urgente.'
  },
  {
    icon: TrendingUp,
    title: 'Lucro Real',
    description: 'Dashboard financeiro com faturamento e custos claros.'
  },
  {
    icon: Clock,
    title: 'Gestão Unificada',
    description: 'Pedidos, clientes e finanças em um só lugar.'
  }
];

function LoginContent() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState('login');

  useEffect(() => {
    if (mode === 'signup') {
      setTab('signup');
    }
  }, [mode]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(userCredential)?.isNewUser;
      
      if (isNewUser) {
        let utmData = {};
        try {
          const savedUtms = sessionStorage.getItem('atelierflow_utm_params');
          if (savedUtms) {
            utmData = JSON.parse(savedUtms);
          }
        } catch (err) {
          console.error('Erro ao ler UTMs no cadastro Google:', err);
        }

        trackFbqEvent('Lead', {
          content_name: 'Cadastro AtelierFlow via Google',
          status: 'success',
          ...utmData
        });
      }
    } catch (error) {
      console.error('Error signing in with Google: ', error);
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: "Não foi possível entrar com o Google."
      });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error: any) {
      console.error('Error signing in with Email: ', error);
      let errorMessage = "Erro ao entrar com e-mail e senha";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "E-mail ou senha incorretos";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido";
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail || !signUpPassword || !confirmPassword || !name) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas divergentes",
        description: "As senhas digitadas não coincidem."
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Track Meta Pixel CompleteRegistration
      let utmData = {};
      try {
        const savedUtms = sessionStorage.getItem('atelierflow_utm_params');
        if (savedUtms) {
          utmData = JSON.parse(savedUtms);
        }
      } catch (err) {
        console.error('Erro ao ler UTMs no cadastro Email:', err);
      }

      trackFbqEvent('Lead', {
        content_name: 'Cadastro AtelierFlow via Email',
        status: 'success',
        ...utmData
      });

      toast({
        title: "Conta criada!",
        description: "Sua conta foi criada com sucesso."
      });
    } catch (error: any) {
      console.error('Error creating user with Email: ', error);
      let errorMessage = "Erro ao criar conta";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "O login com e-mail e senha não está habilitado no Firebase.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      {/* Left Side: Visuals & Benefits (Lg only) */}
      <div className="relative hidden w-0 lg:block lg:flex-1 bg-muted overflow-hidden">
        <Image 
          src="/images/login-bg.png" 
          alt="Professional Atelier" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-2xl shadow-xl">
              <Logo className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-headline font-black text-white tracking-tight">AtelierFlow</h2>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                Seu ateliê, profissionalizado
              </div>
              <h1 className="text-5xl font-headline font-bold text-white leading-tight">
                Transforme sua arte <br/> em um <span className="italic underline decoration-primary">negócio de sucesso.</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-lg">
              {benefits.map((benefit, idx) => (
                <motion.div 
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors group"
                >
                  <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{benefit.title}</h3>
                    <p className="text-white/70 text-sm leading-snug">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12 relative">
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-headline font-bold text-xl text-primary">AtelierFlow</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto flex w-full max-w-[400px] flex-col space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground font-medium">
              Entre para continuar gerenciando suas produções.
            </p>
          </div>
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-2xl border border-muted">
              <TabsTrigger value="login" className="rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Criar Conta</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="login" className="space-y-6 pt-6">
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleEmailSignIn} 
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="h-12 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Senha</Label>
                      <button type="button" className="text-xs font-bold text-primary hover:underline">Esqueceu a senha?</button>
                    </div>
                    <Input 
                      id="login-password" 
                      type="password" 
                      className="h-12 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar na plataforma'}
                  </Button>
                </motion.form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6 pt-6">
                <motion.form 
                  key="signup-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleEmailSignUp} 
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      placeholder="Seu nome" 
                      className="h-12 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="h-12 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        className="h-12 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        className="h-12 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-secondary text-secondary-foreground" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar minha conta agora'}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <div className="w-full space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-medium">Ou conecte-se com</span>
                </div>
              </div>

              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full h-12 rounded-xl text-base font-bold shadow-sm border-muted hover:bg-muted/50 transition-colors border-2">
                  <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 266.1 0 129.9 109.8 20 244 20c74.3 0 134.3 29.3 178.6 71.7l-62.8 62.1C337 114.6 296.3 95.3 244 95.3c-82.6 0-149.3 67.5-149.3 170.8 0 103.2 66.7 170.8 149.3 170.8 98.2 0 129.2-74.4 132.8-112.4H244v-81.4h238.2c2.6 14.7 4.2 30.8 4.2 47.4z"></path></svg>
                  Continuar com Google
              </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground leading-relaxed md:px-12">
            Ao continuar, você concorda com nossos <a href="#" className="underline hover:text-primary">Termos de Serviço</a> e <a href="#" className="underline hover:text-primary">Política de Privacidade</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

// Rename the internal to differentiate or export properly
const LoginPageContent = LoginContent;
