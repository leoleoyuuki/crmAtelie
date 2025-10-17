'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { Firestore, collection, onSnapshot, query } from 'firebase/firestore';
import { app, auth, db } from './config';
import { Order } from '@/lib/types';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      app,
      auth,
      db,
      user,
      loading,
    }),
    [user, loading]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
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
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          const docData = doc.data();
          const convertedData = {
            ...docData,
            id: doc.id,
            // Convert Firestore Timestamps to JS Dates
            ...Object.fromEntries(
                Object.entries(docData).map(([key, value]) => 
                    value && typeof value === 'object' && 'seconds' in value 
                    ? [key, new Date(value.seconds * 1000)] 
                    : [key, value]
                )
            )
          } as T;
          result.push(convertedData);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}

export function useDoc<T>(path: string) {
    // Similar to useCollection, but for a single document
    return { data: null, loading: true, error: null };
}
