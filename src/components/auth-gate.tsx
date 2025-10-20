'use client';

import { useAuth } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import React from 'react';

export default function AuthGate({
  children,
  loginPage,
}: {
  children: React.ReactNode;
  loginPage: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
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
    return <>{loginPage}</>;
  }

  return <>{children}</>;
}
