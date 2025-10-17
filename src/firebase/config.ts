import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDRoNk2BUS4FetYBnr_4pYqnNv8QuDfLK8",
  authDomain: "prefab-botany-452618-d2.firebaseapp.com",
  projectId: "prefab-botany-452618-d2",
  storageBucket: "prefab-botany-452618-d2.appspot.com",
  messagingSenderId: "1035582953447",
  appId: "1:1035582953447:web:707e7388f3aa0c14f4cf42"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
