import * as admin from 'firebase-admin';
import './load-env'; // Carrega as variáveis de ambiente

// Esta função garante que o app seja inicializado apenas uma vez.
function initializeAdmin() {
  // Verifica se o app já foi inicializado
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    // Garante que a chave privada seja uma string, mesmo que a variável de ambiente não esteja definida
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  // Verifica se as credenciais da conta de serviço estão presentes
  if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      console.error('Erro ao inicializar o Firebase Admin SDK:', error.stack);
      // Lança um erro para que a falha na inicialização seja evidente
      throw new Error('Falha na inicialização do Firebase Admin SDK.');
    }
  } else {
    // Em produção, a ausência de variáveis é um erro crítico para esta rota.
    if (process.env.NODE_ENV === 'production') {
        console.error('As variáveis de ambiente do Firebase Admin não estão configuradas em produção.');
    }
    // Retorna null se as variáveis não estiverem configuradas
    return null;
  }
}

const adminApp = initializeAdmin();

// Exporta as instâncias do db e auth, que podem ser nulas se a inicialização falhar
export const adminDb = adminApp ? admin.firestore() : null;
export const adminAuth = adminApp ? admin.auth() : null;
