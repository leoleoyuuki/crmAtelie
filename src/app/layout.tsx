
'use client';

import type { Metadata } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import AppShell from '@/components/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import LoginPage from './login/page';
import AtivacaoPage from './ativacao/page';
import LandingPage from './landing/page';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { PasswordProvider } from '@/contexts/password-context';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';

function AuthWrapper({ children }: { children: React.ReactNode }) {
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

          if (userProfile.status === 'active' && userProfile.expiresAt) {
            if (new Date() > userProfile.expiresAt) {
              updateDoc(userRef, { status: 'inactive' }).catch(err => {
                  console.error("Failed to update user status to inactive:", err);
              });
              return; 
            }
          }

          setProfile(userProfile);

        } else {
          const newUserProfile: Omit<UserProfile, 'id'> = {
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            status: 'inactive',
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

  useEffect(() => {
    if (userLoading || profileLoading) return;

    if (!user) {
      // Allow public access to Landing, Login and Blog
      const isPublicPath = pathname === '/landing' || pathname === '/login' || pathname.startsWith('/blog');
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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }
  
  if (shouldRedirect) {
      return (
         <div className="flex h-screen items-center justify-center">
          Redirecionando...
        </div>
      );
  }

  if (!user) {
    if (pathname === '/login') {
        return <LoginPage />;
    }
    if (pathname.startsWith('/blog')) {
        return <>{children}</>;
    }
    return <LandingPage />;
  }

  if (pathname === '/ativacao' || pathname.startsWith('/admin') || pathname.startsWith('/blog')) {
    return <>{children}</>;
  }

  if (profile?.status !== 'active') {
    return <AtivacaoPage />;
  }

  return (
    <SidebarProvider>
      <PasswordProvider>
        <AppShell profile={profile}>
          {children}
        </AppShell>
      </PasswordProvider>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>AtelierFlow</title>
        <meta name="description" content="Otimize seu fluxo de trabalho de alfaiataria e artesanato." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '25321081740913131');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=25321081740913131&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
