
'use server';

import { auth, db } from '@/firebase/config';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { add } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function activateAccount(token: string): Promise<void> {
  const { currentUser } = auth;
  if (!currentUser) {
    throw new Error('Usuário não autenticado.');
  }

  const tokenQuery = query(collection(db, 'accessTokens'), where('code', '==', token));
  const tokenSnapshot = await getDocs(tokenQuery);

  if (tokenSnapshot.empty) {
    throw new Error('Código de ativação inválido.');
  }

  const tokenDoc = tokenSnapshot.docs[0];
  const tokenData = tokenDoc.data();

  if (tokenData.isUsed) {
    throw new Error('Este código já foi utilizado.');
  }

  const userRef = doc(db, 'users', currentUser.uid);
  const tokenRef = tokenDoc.ref;

  // Calculate expiration date
  const now = new Date();
  const expiresAt = add(now, { months: tokenData.duration });

  try {
    const batch = writeBatch(db);

    // Update user profile
    batch.update(userRef, {
      status: 'active',
      expiresAt: expiresAt,
    });

    // Mark token as used
    batch.update(tokenRef, {
      isUsed: true,
      usedBy: currentUser.uid,
      usedAt: now,
    });

    await batch.commit();
    
    // Revalidate paths to update UI across the app
    revalidatePath('/');
    revalidatePath('/ativacao');

  } catch (error) {
    console.error("Error activating account:", error);
    // This could be a permissions error, which should be handled by Firestore rules
    throw new Error('Ocorreu um erro ao ativar a conta. Verifique suas permissões.');
  }
}
