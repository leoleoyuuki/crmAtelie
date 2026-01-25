'use client';

import { doc, getDoc, writeBatch, Firestore, User, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { add } from 'date-fns';
import { db } from '@/firebase/config';

export type TokenDurationIdentifier = number;

// Helper function to map plan identifiers to durations
const getDurationFromToken = (durationValue: TokenDurationIdentifier): { value: number, unit: 'days' | 'months' } => {
    if (durationValue < 1) {
        if (durationValue === 0.1) return { value: 3, unit: 'days' };
        if (durationValue === 0.25) return { value: 7, unit: 'days' };
    }
    return { value: durationValue, unit: 'months' };
}


/**
 * Processes a one-time activation token, marks it as used, and activates the user's account.
 * This function is called by the client (logged-in user).
 * @param user - The user object.
 * @param token - The activation token string.
 */
export async function redeemActivationToken(user: User, token: string): Promise<void> {
  const tokenRef = doc(db, 'accessTokens', token);
  const userRef = doc(db, 'users', user.uid);

  try {
    const tokenSnapshot = await getDoc(tokenRef);

    if (!tokenSnapshot.exists()) {
      throw new Error('Código de ativação inválido.');
    }

    const tokenData = tokenSnapshot.data();

    if (tokenData.isUsed) {
      throw new Error('Este código já foi utilizado.');
    }
    
    const tokenDuration = tokenData.duration as TokenDurationIdentifier;
    
    // We use a transaction to ensure both operations (activating user and using token) succeed or fail together.
    const batch = writeBatch(db);

    const userDoc = await getDoc(userRef);
    let startDate = new Date();

    if (userDoc.exists() && userDoc.data().status === 'active' && userDoc.data().expiresAt) {
        const currentExpiration = (userDoc.data().expiresAt as Timestamp).toDate();
        if (currentExpiration > new Date()) {
            startDate = currentExpiration;
        }
    }

    const { value, unit } = getDurationFromToken(tokenDuration);
    const expiresAt = add(startDate, { [unit]: value });

    // Update user profile within the batch
    batch.update(userRef, {
        status: 'active',
        expiresAt: Timestamp.fromDate(expiresAt),
    });

    // Mark token as used within the batch
    batch.update(tokenRef, {
      isUsed: true,
      usedBy: user.email,
      usedAt: serverTimestamp(),
    });

    // Commit the atomic operation
    await batch.commit();

  } catch (error) {
    console.error("Error redeeming token:", error);
    if (error instanceof Error && (error.message.includes('invalid') || error.message.includes('utilizado'))) {
      throw error;
    }
    throw new Error('Ocorreu um erro ao ativar a conta. Verifique o código e tente novamente.');
  }
}


/**
 * Starts a free trial for a user, activating their account for 7 days.
 * @param user The authenticated user object.
 */
export async function startFreeTrial(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid);

    try {
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.trialStarted) {
                throw new Error("Você já utilizou seu período de teste.");
            }
            if (userData.status === 'active') {
                throw new Error("Sua conta já está ativa com um plano.");
            }
        }
        
        const expiresAt = add(new Date(), { days: 7 });

        await updateDoc(userRef, {
            status: 'active',
            expiresAt: Timestamp.fromDate(expiresAt),
            trialStarted: true,
        });

    } catch (error) {
        console.error("Error starting free trial:", error);
        if (error instanceof Error) {
            throw error; // Re-throw known errors
        }
        throw new Error('Ocorreu um erro ao iniciar seu período de teste. Tente novamente.');
    }
}
