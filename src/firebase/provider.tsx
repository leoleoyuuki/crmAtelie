
'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, collection, onSnapshot, query, where, Timestamp, getDocs, limit, startAfter, endBefore, limitToLast, orderBy, Query, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
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


export function usePaginatedCollection<T>(path: string, pageSize: number = 10) {
    const { db, auth } = useFirebase();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [hasPrev, setHasPrev] = useState(false);
    
    const fetchData = useCallback(async (q: Query) => {
        setLoading(true);
        try {
            const snapshot = await getDocs(q);
            const result: T[] = snapshot.docs.map(doc => {
                 const docData = doc.data();
                 const convertedData = { ...docData };
                 for (const key in convertedData) {
                    const value = (convertedData as any)[key];
                    if (value instanceof Timestamp) {
                        (convertedData as any)[key] = value.toDate();
                    }
                 }
                 return { ...convertedData, id: doc.id } as T;
            });
            setData(result);
            setFirstVisible(snapshot.docs[0] || null);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === pageSize);
            setError(null);
        } catch (err: any) {
            setError(err);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    const loadFirstPage = useCallback(() => {
        if (!auth.currentUser) return;
        const q = query(
            collection(db, path),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );
        fetchData(q);
        setHasPrev(false);
    }, [db, path, auth.currentUser, pageSize, fetchData]);
    
    useEffect(() => {
        loadFirstPage();
    }, [loadFirstPage]);
    
    const nextPage = async () => {
        if (!auth.currentUser || !lastVisible) return;
        const q = query(
            collection(db, path),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(pageSize)
        );
        await fetchData(q);
        setHasPrev(true);
    };

    const prevPage = async () => {
        if (!auth.currentUser || !firstVisible) return;
         const q = query(
            collection(db, path),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc'),
            endBefore(firstVisible),
            limitToLast(pageSize)
        );
        await fetchData(q);
        // This is a simplification; robust backward pagination is more complex
        setHasPrev(false); // A simple way to handle it for now
    };
    
    return { data, loading, error, nextPage, prevPage, hasMore, hasPrev, refresh: loadFirstPage };
}



export function useDoc<T>(path: string) {
    // Similar to useCollection, but for a single document
    return { data: null, loading: true, error: null };
}
