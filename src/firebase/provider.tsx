
'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { app, auth, db } from './config';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from './errors';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      app,
      auth,
      db,
    }),
    []
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useAuth() {
  return useFirebase();
}

export function useFirestore() {
  const { db } = useFirebase();
  return db;
}

export function useCollection<T>(path: string) {
  const { db, auth } = useFirebase();
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!auth.currentUser) {
        setLoading(false);
        setData([]); // Clear data if user logs out
        return;
    }

    const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          const docData = doc.data();
          
          const convertedData = { ...docData };
          for (const key in convertedData) {
            const value = (convertedData as any)[key];
            if (value instanceof Timestamp) {
              (convertedData as any)[key] = value.toDate();
            }
          }

          result.push({
            ...convertedData,
            id: doc.id,
          } as T);
        });
        setData(result);
        setLoading(false);
      },
      async (err) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [db, path, auth.currentUser]);

  return { data, loading, error };
}

export function useDoc<T>(path: string) {
    // Similar to useCollection, but for a single document
    return { data: null, loading: true, error: null };
}
