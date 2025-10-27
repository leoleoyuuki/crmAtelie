
'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { isFirestorePermissionError } from '@/firebase/errors';
import { useAuth } from '@/firebase/provider';

// This component listens for permission errors and throws them to be caught by Next.js's dev overlay.
export function FirebaseErrorListener() {
  const { auth } = useAuth(); // Get auth to enrich the error context

  useEffect(() => {
    const handlePermissionError = (error: unknown) => {
      if (isFirestorePermissionError(error)) {
        // Log the auth object to the console for easy inspection
        console.group('Firebase Permission Error Details');
        console.log('User Auth Object:', auth.currentUser);
        console.groupEnd();
        
        // Throw the full, detailed error message to the Next.js overlay
        throw new Error(error.fullMessage);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, [auth]);

  return null; // This component does not render anything
}
