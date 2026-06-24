'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import AppShell from '@/components/app-shell';
import LoginPage from '@/app/login/page';
import AtivacaoPage from '@/app/ativacao/page';
import LandingPage from '@/app/landing/page';
import LoadingScreen from '@/components/loading-screen';

import { useUser } from '@/firebase/auth/use-user';
import { PasswordProvider } from '@/contexts/password-context';
import PhoneRequiredScreen from '@/components/phone-required-screen';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { notifyTrialExpiredAction } from '@/app/actions/notifications';

const knownAppRoutes = [
  '/', '/pedidos', '/clientes', '/tarefas', '/compras',
  '/estoque', '/configuracoes', '/ajuda', '/vendas',
  '/catalogo', '/tabela-precos', '/ativacao', '/implementando',
  '/admin', '/freetools', '/calculadora', '/print', '/blog',
  '/landing', '/login', '/fluxo-caixa',
];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const { db } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const userProfileData = docSnap.data();
          let userProfile = { ...userProfileData, id: docSnap.id } as UserProfile;
          
          if (userProfile.expiresAt && (userProfile.expiresAt as any).toDate) {
             userProfile.expiresAt = (userProfile.expiresAt as any).toDate();
          }
          if (userProfile.trialExpiresAt && (userProfile.trialExpiresAt as any).toDate) {
             userProfile.trialExpiresAt = (userProfile.trialExpiresAt as any).toDate();
          }

          if (userProfile.status === 'active' && userProfile.expiresAt) {
            if (new Date() > userProfile.expiresAt) {
              // Notificar sobre o encerramento do trial antes de desativar
              const isTrialExpired = userProfile.trialExpiresAt 
                ? userProfile.trialExpiresAt.getTime() >= userProfile.expiresAt.getTime()
                : userProfile.trialStarted;

              if (isTrialExpired) {
                notifyTrialExpiredAction({
                  name: userProfile.displayName,
                  email: userProfile.email,
                  phone: userProfile.phone
                });
              }

              updateDoc(userRef, { status: 'inactive' }).catch(err => {
                  console.error("Failed to update user status to inactive:", err);
              });
              return; 
            }
          }

          setProfile(userProfile);

        } else {
          // Busca UTMs e fbclid salvos no sessionStorage para registrar na criação do perfil
          let utmCampaign = null;
          let utmSource = null;
          let utmMedium = null;
          let utmContent = null;
          let utmTerm = null;
          let fbclid = null;

          try {
            const savedUtms = sessionStorage.getItem('atelierflow_utm_params');
            if (savedUtms) {
              const utmData = JSON.parse(savedUtms);
              utmCampaign = utmData.utm_campaign || null;
              utmSource = utmData.utm_source || null;
              utmMedium = utmData.utm_medium || null;
              utmContent = utmData.utm_content || null;
              utmTerm = utmData.utm_term || null;
              fbclid = utmData.fbclid || null;
            }
          } catch (e) {
            console.error('Erro ao ler UTMs para salvar no Firestore:', e);
          }

          const newUserProfile: any = {
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            status: 'inactive',
            utmCampaign,
            utmSource,
            utmMedium,
            utmContent,
            utmTerm,
            fbclid,
          };
          setDoc(userRef, newUserProfile).catch(err => {
              console.error("Failed to create user profile:", err);
          });
          setProfile(newUserProfile as UserProfile);
        }
        setProfileLoading(false);
      });
      return () => unsub();
    } else if (!userLoading) {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user, db, userLoading]);

  // Captura parâmetros de UTM para rastreamento de campanhas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const utmCampaign = urlParams.get('utm_campaign');
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmContent = urlParams.get('utm_content');
        const utmTerm = urlParams.get('utm_term');
        const fbclid = urlParams.get('fbclid');

        if (utmCampaign || utmSource || fbclid) {
          const utmData: Record<string, string> = {};
          if (utmCampaign) utmData.utm_campaign = utmCampaign;
          if (utmSource) utmData.utm_source = utmSource;
          if (utmMedium) utmData.utm_medium = utmMedium;
          if (utmContent) utmData.utm_content = utmContent;
          if (utmTerm) utmData.utm_term = utmTerm;
          if (fbclid) utmData.fbclid = fbclid;

          const existingData = sessionStorage.getItem('atelierflow_utm_params');
          const parsedExisting = existingData ? JSON.parse(existingData) : {};
          sessionStorage.setItem(
            'atelierflow_utm_params',
            JSON.stringify({ ...parsedExisting, ...utmData })
          );
        }
      } catch (err) {
        console.error('Erro ao salvar parâmetros UTM:', err);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (userLoading || profileLoading) return;

    if (!user) {
      // Permitir acesso público à Landing, Login e Blog
      const isPublicPath = pathname === '/landing' || pathname === '/login' || pathname.startsWith('/blog') || pathname.startsWith('/freetools');
      if (!isPublicPath) {
          return; 
      }
      return;
    }

    const isActivationPage = pathname === '/ativacao';
    const isAdminPage = pathname.startsWith('/admin');
    const isPublicButLoggedIn = pathname === '/landing' || pathname.startsWith('/blog');

    if (profile?.status !== 'active' && !isActivationPage && !isAdminPage && !isPublicButLoggedIn) {
      setShouldRedirect('/ativacao');
    } else if (profile?.status === 'active' && isActivationPage) {
      setShouldRedirect('/');
    } else {
      setShouldRedirect(null);
    }
  }, [user, profile, profileLoading, userLoading, pathname]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(shouldRedirect);
    }
  }, [shouldRedirect, router]);

  const loading = userLoading || (user && profileLoading);

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (shouldRedirect) {
      return (
         <div className="flex h-screen items-center justify-center w-full">
          Redirecionando...
        </div>
      );
  }

  if (!user) {
    if (pathname === '/login') {
        return <LoginPage />;
    }
    if (pathname.startsWith('/blog') || pathname.startsWith('/freetools')) {
        return <div className="w-full">{children}</div>;
    }
    // Rotas conhecidas do app (requerem login): mostra landing
    // Rotas desconhecidas: deixa o Next.js renderizar o not-found.tsx
    const isKnownAppRoute = knownAppRoutes.some(r =>
      pathname === r || pathname.startsWith(r + '/')
    );
    if (isKnownAppRoute) {
      return <LandingPage />;
    }
    // Rota desconhecida → renderiza o not-found.tsx do Next.js
    return <div className="w-full">{children}</div>;
  }

  if (pathname === '/ativacao' || pathname === '/ativacao/sucesso' || pathname.startsWith('/admin') || pathname.startsWith('/blog')) {
    return <div className="w-full">{children}</div>;
  }

  if (profile?.status !== 'active') {
    return <AtivacaoPage />;
  }

  if (!profile?.phone) {
    return <PhoneRequiredScreen profile={profile} />;
  }

  // Usuário logado em rota desconhecida → 404 sem AppShell
  const isKnownAppRoute = knownAppRoutes.some(r =>
    pathname === r || pathname.startsWith(r + '/')
  );
  if (!isKnownAppRoute) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <PasswordProvider>
      <SidebarProvider>
        <AppShell profile={profile}>
          {children}
        </AppShell>
      </SidebarProvider>
    </PasswordProvider>
  );
}
