'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore, collection, onSnapshot, query, where, Timestamp, getDocs, limit, startAfter, endBefore, limitToLast, orderBy, Query, DocumentData, QueryDocumentSnapshot, doc } from 'firebase/firestore';
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

interface CollectionOptions {
  limit?: number;
  orderBy?: [string, 'asc' | 'desc'];
  dateRange?: [Date, Date];
  refreshTrigger?: any;
}

export function useCollection<T>(path: string, options: CollectionOptions = {}) {
  const { db, auth } = useFirebase();
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const limitValue = options.limit;
  const orderByValue = options.orderBy;
  const dateRange = options.dateRange;

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(prev => prev + 1);

  React.useEffect(() => {
    if (!auth.currentUser) {
        setLoading(false);
        setData([]); // Clear data if user logs out
        return;
    }

    const collectionRef = collection(db, path);
    const queryConstraints = [where('userId', '==', auth.currentUser.uid)];

    if (orderByValue) {
      queryConstraints.push(orderBy(orderByValue[0], orderByValue[1]));
    }
    if (limitValue) {
      queryConstraints.push(limit(limitValue));
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
        queryConstraints.push(where('date', '>=', dateRange[0]));
        queryConstraints.push(where('date', '<=', dateRange[1]));
    }
    
    const q = query(collectionRef, ...queryConstraints);

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
  }, [db, path, auth.currentUser, limitValue, orderByValue?.[0], orderByValue?.[1], dateRange, refreshKey]);

  return { data, loading, error, refresh };
}


/**
 * usePaginatedCollection with Cumulative Caching.
 * Implements "Ver Mais" (load and append) and "Ver Menos" (slice local cache).
 */
export function usePaginatedCollection<T>(path: string, pageSize: number = 10) {
    const { db, auth } = useFirebase();
    const [allFetchedData, setAllFetchedData] = useState<T[]>([]);
    const [visibleLimit, setVisibleLimit] = useState(pageSize);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasMoreInDB, setHasMoreInDB] = useState(true);
    
    // Using Ref for cursor to avoid re-triggering loadBatch due to dependency loop
    const lastVisibleRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

    const loadBatch = useCallback(async (isInitial = false) => {
        if (!auth.currentUser) return;
        setLoading(true);
        
        let q = query(
            collection(db, path),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        if (!isInitial && lastVisibleRef.current) {
            q = query(q, startAfter(lastVisibleRef.current));
        }

        try {
            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => {
                 const docData = doc.data();
                 const convertedData = { ...docData };
                 for (const key in convertedData) {
                    if ((convertedData as any)[key] instanceof Timestamp) {
                        (convertedData as any)[key] = (convertedData as any)[key].toDate();
                    }
                 }
                 return { ...convertedData, id: doc.id } as T;
            });

            if (isInitial) {
                setAllFetchedData(items);
                lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
                setHasMoreInDB(snapshot.docs.length === pageSize);
                setVisibleLimit(pageSize);
            } else {
                setAllFetchedData(prev => [...prev, ...items]);
                lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
                setHasMoreInDB(snapshot.docs.length === pageSize);
            }
            setError(null);
        } catch (err: any) {
            setError(err);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [db, path, auth.currentUser, pageSize]);

    useEffect(() => {
        loadBatch(true);
    }, [loadBatch]);

    const loadMore = useCallback(async () => {
        // 1. If we have items in the cache that are not being shown, just increment visibleLimit
        if (allFetchedData.length > visibleLimit) {
            setVisibleLimit(prev => prev + pageSize);
            return;
        }
        
        // 2. Otherwise, if there is more in DB, fetch next batch
        if (hasMoreInDB) {
            await loadBatch(false);
            setVisibleLimit(prev => prev + pageSize);
        }
    }, [allFetchedData.length, visibleLimit, hasMoreInDB, loadBatch, pageSize]);

    const showLess = useCallback(() => {
        setVisibleLimit(prev => Math.max(pageSize, prev - pageSize));
    }, [pageSize]);

    const data = useMemo(() => allFetchedData.slice(0, visibleLimit), [allFetchedData, visibleLimit]);
    const hasMore = hasMoreInDB || allFetchedData.length > visibleLimit;
    const hasPrev = visibleLimit > pageSize;

    return { 
        data, 
        loading, 
        error, 
        nextPage: loadMore, 
        prevPage: showLess, 
        hasMore, 
        hasPrev, 
        refresh: () => loadBatch(true) 
    };
}

export function useDocument<T>(path: string | null) {
  const { db } = useFirebase();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      setData(null);
      return;
    }

    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const docData = docSnap.data();
          const convertedData: any = { ...docData };
          for (const key in convertedData) {
            if (convertedData[key] instanceof Timestamp) {
              convertedData[key] = convertedData[key].toDate();
            }
          }
          setData({ id: docSnap.id, ...convertedData } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}
