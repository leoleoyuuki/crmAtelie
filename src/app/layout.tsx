
'use client';

import type { Metadata } from 'next';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, useAuth } from '@/firebase';
import AppShell from '@/components/app-shell';
import { SidebarProvider } from '@/components/ui/sidebar';
import LoginPage from './login/page';
import { Skeleton } from '@/components/ui/skeleton';

// Metadata is now static as it's a client component
// export const metadata: Metadata = {
//   title: 'AtelierFlow',
//   description: 'Otimize seu fluxo de trabalho de alfaiataria e artesanato.',
// };

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

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

  if (!user) {
    // If we are on any page that is not the login page, and we are not logged in,
    // we should render the login page. This prevents rendering the login page
    // within the app shell when the user logs out.
    return <LoginPage />;
  }

  return (
    <SidebarProvider>
      <AppShell>
        {children}
      </AppShell>
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
