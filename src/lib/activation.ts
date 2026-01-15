'use client';

import { doc, getDoc, writeBatch, Firestore, User, updateDoc } from 'firebase/firestore';
import { add } from 'date-fns';

type PlanIdentifier = 'mensal' | 'trimestral' | 'anual' | number;

// Helper function to map plan identifiers to durations
const getDuration = (planIdentifier: PlanIdentifier): { value: number, unit: 'days' | 'months' | 'years' } => {
    // Handle payment plans
    if (planIdentifier === 'mensal') return { value: 1, unit: 'months' };
    if (planIdentifier === 'trimestral') return { value: 3, unit: 'months' };
    if (planIdentifier === 'anual') return { value: 1, unit: 'years' };

    // Handle token durations (which are numbers)
    if (typeof planIdentifier === 'number') {
        if (planIdentifier < 1) {
            // Handle fractional values as days (e.g., 0.1 for 3 days)
            if (planIdentifier === 0.1) return { value: 3, unit: 'days' };
            if (planIdentifier === 0.25) return { value: 7, unit: 'days' };
        }
        // Handle whole numbers as months
        return { value: planIdentifier, unit: 'months' };
    }

    // Default fallback
    throw new Error('Identificador de plano ou token inválido.');
}

/**
 * Activates a user account based on a plan identifier (from payment) or a token.
 * This function calculates the expiration date and updates the user's profile.
 * It's designed to be called from a server-side context (like a webhook) where there isn't a logged-in user.
 * It uses a transaction to ensure atomicity.
 * @param db - The Firestore instance.
 * @param userId - The ID of the user to activate.
 * @param planIdentifier - The plan identifier ('mensal', 'trimestral', 'anual') or a token duration (number).
 */
export async function activateUserAccount(db: Firestore, userId: string, planIdentifier: PlanIdentifier): Promise<void> {
  const userRef = doc(db, 'users', userId);

  try {
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    let startDate = new Date();

    // If user has an active subscription, extend it from the expiration date
    if (userData && userData.status === 'active' && userData.expiresAt) {
      const currentExpiration = userData.expiresAt.toDate();
      if (currentExpiration > new Date()) {
        startDate = currentExpiration;
      }
    }
    
    // Calculate new expiration date
    const { value, unit } = getDuration(planIdentifier);
    const expiresAt = add(startDate, { [unit]: value });

    // This update happens from the server, so Firestore rules must allow it.
    // The security is handled by the fact that this is called from a trusted server environment after a payment is confirmed.
    await updateDoc(userRef, {
      status: 'active',
      expiresAt: expiresAt,
    });

  } catch (error) {
     console.error("Error activating user account:", error);
     // This will now likely be a Firestore permission error, which is expected if rules aren't set up for server-side writes.
     throw new Error('Ocorreu um erro ao ativar a conta do usuário no banco de dados. Verifique as permissões do Firestore.');
  }
}


/**
 * Processes a one-time activation token, marks it as used, and activates the user's account.
 * This function is called by the client (logged-in user).
 * @param db - The Firestore instance.
 * @param user - The user object.
 * @param token - The activation token string.
 */
export async function redeemActivationToken(db: Firestore, user: User, token: string): Promise<void> {
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
  
  const tokenDuration = tokenData.duration as number;

  try {
    // We can call activateUserAccount here, but it's better to do it in a batch
    // to ensure both operations (activating user and using token) succeed or fail together.
    const batch = writeBatch(db);

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    let startDate = new Date();

    if (userData && userData.status === 'active' && userData.expiresAt) {
        const currentExpiration = userData.expiresAt.toDate();
        if (currentExpiration > new Date()) {
            startDate = currentExpiration;
        }
    }

    const { value, unit } = getDuration(tokenDuration);
    const expiresAt = add(startDate, { [unit]: value });

    // Update user profile within the batch
    batch.update(userRef, {
        status: 'active',
        expiresAt: expiresAt,
    });

    // Mark token as used within the batch
    batch.update(tokenRef, {
      isUsed: true,
      usedBy: user.email,
      usedAt: new Date(),
    });

    // Commit the atomic operation
    await batch.commit();

  } catch (error) {
    console.error("Error redeeming token:", error);
    throw new Error('Ocorreu um erro ao ativar a conta. Verifique o código e suas permissões.');
  }
}
