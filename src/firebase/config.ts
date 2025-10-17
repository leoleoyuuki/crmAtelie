import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANKnkA1zrs4TU3OeFzCLYWk6Lkfk70Gh0",
  authDomain: "booklove-microsaas.firebaseapp.com",
  projectId: "booklove-microsaas",
  storageBucket: "booklove-microsaas.appspot.com",
  messagingSenderId: "1054144080507",
  appId: "1:1054144080507:web:cb1eca7ac412d9fde810de"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
