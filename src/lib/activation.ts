
'use client';

import { doc, getDoc, writeBatch, Firestore, User } from 'firebase/firestore';
import { add } from 'date-fns';

export async function activateAccount(db: Firestore, user: User, token: string): Promise<void> {

  // The document ID is the token itself
  const tokenRef = doc(db, 'accessTokens', token);
  const tokenSnapshot = await getDoc(tokenRef);

  if (!tokenSnapshot.exists()) {
    throw new Error('Código de ativação inválido.');
  }

  const tokenData = tokenSnapshot.data();

  if (tokenData.isUsed) {
    throw new Error('Este código já foi utilizado.');
  }

  const userRef = doc(db, 'users', user.uid);
  
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
      usedBy: user.uid,
      usedAt: now,
    });

    await batch.commit();

  } catch (error) {
    console.error("Error activating account:", error);
    // This could be a permissions error, which should be handled by Firestore rules
    throw new Error('Ocorreu um erro ao ativar a conta. Verifique suas permissões.');
  }
}
