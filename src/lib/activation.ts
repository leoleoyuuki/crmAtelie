
'use client';

import { doc, getDoc, writeBatch, Firestore, User } from 'firebase/firestore';
import { add, addMonths } from 'date-fns';

// Helper function to map fractional months to days
const getDuration = (durationValue: number): { value: number, unit: 'days' | 'months' } => {
    if (durationValue < 1) {
        // Handle fractional values as days (e.g., 0.25 for 7 days)
        if (durationValue === 0.1) return { value: 3, unit: 'days' };
        if (durationValue === 0.25) return { value: 7, unit: 'days' };
    }
    // Handle whole numbers as months
    return { value: durationValue, unit: 'months' };
}


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
  const { value, unit } = getDuration(tokenData.duration);
  const expiresAt = add(now, { [unit]: value });


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
      usedBy: user.email,
      usedAt: now,
    });

    await batch.commit();

  } catch (error) {
    console.error("Error activating account:", error);
    // This could be a permissions error, which should be handled by Firestore rules
    throw new Error('Ocorreu um erro ao ativar a conta. Verifique suas permissões.');
  }
}
