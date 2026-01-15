import * as admin from 'firebase-admin';
import './load-env'; // Carrega as variáveis de ambiente

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    console.error('Erro ao inicializar o Firebase Admin SDK:', error.code);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
