
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import AppShell from '@/components/app-shell';
import LoginPage from '@/app/login/page';
import AtivacaoPage from '@/app/ativacao/page';
import LandingPage from '@/app/landing/page';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { PasswordProvider } from '@/contexts/password-context';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';

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
      // Permitir acesso público à Landing, Login e Blog
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
      <div className="flex h-screen items-center justify-center w-full">
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
         <div className="flex h-screen items-center justify-center w-full">
          Redirecionando...
        </div>
      );
  }

  if (!user) {
    if (pathname === '/login') {
        return <LoginPage />;
    }
    if (pathname.startsWith('/blog')) {
        return <div className="w-full">{children}</div>;
    }
    return <LandingPage />;
  }

  if (pathname === '/ativacao' || pathname.startsWith('/admin') || pathname.startsWith('/blog')) {
    return <div className="w-full">{children}</div>;
  }

  if (profile?.status !== 'active') {
    return <AtivacaoPage />;
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
