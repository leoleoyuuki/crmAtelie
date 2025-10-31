

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
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { PasswordProvider } from '@/contexts/password-context';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';


// Metadata is now static as it's a client component
// export const metadata: Metadata = {
//   title: 'AtelierFlow',
//   description: 'Otimize seu fluxo de trabalho de alfaiataria e artesanato.',
// };

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
      const unsub = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          // Profile doesn't exist, this is a new user. Create it.
          const newUserProfile: Omit<UserProfile, 'id'> = {
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            status: 'inactive',
          };
          // We don't await this, as the onSnapshot will pick up the change
          setDoc(userRef, newUserProfile).catch(err => {
              console.error("Failed to create user profile:", err);
          });
          setProfile(newUserProfile as UserProfile);
        }
        setProfileLoading(false);
      });
      return () => unsub();
    } else if (!userLoading) { // Only run if user is confirmed null
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user, db, userLoading]);

  useEffect(() => {
    if (userLoading || profileLoading) return;

    const isActivationPage = pathname === '/ativacao';
    const isAdminPage = pathname.startsWith('/admin');

    if (profile?.status !== 'active' && !isActivationPage && !isAdminPage) {
      setShouldRedirect('/ativacao');
    } else if (profile?.status === 'active' && isActivationPage) {
      setShouldRedirect('/');
    } else {
      setShouldRedirect(null);
    }
  }, [profile, profileLoading, userLoading, pathname]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(shouldRedirect);
    }
  }, [shouldRedirect, router]);


  const loading = userLoading || profileLoading;

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
    // Not logged in, show login page
    return <LoginPage />;
  }

  // Allow access to admin and activation pages regardless of status
  if (pathname === '/ativacao' || pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Normal app flow for active users
  return (
    <SidebarProvider>
      <PasswordProvider>
        <AppShell>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
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
