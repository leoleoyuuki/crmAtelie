
'use client';

import { doc, getDoc, writeBatch, Firestore, User } from 'firebase/firestore';
import { add, addMonths, addYears } from 'date-fns';

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
 * @param db - The Firestore instance.
 * @param userId - The ID of the user to activate.
 * @param planIdentifier - The plan identifier ('mensal', 'trimestral', 'anual') or a token duration (number).
 */
export async function activateUserAccount(db: Firestore, userId: string, planIdentifier: PlanIdentifier): Promise<void> {
  const userRef = doc(db, 'users', userId);

  // Calculate expiration date
  const now = new Date();
  const { value, unit } = getDuration(planIdentifier);
  const expiresAt = add(now, { [unit]: value });

  try {
    await updateDoc(userRef, {
      status: 'active',
      expiresAt: expiresAt,
    });
  } catch (error) {
     console.error("Error activating user account:", error);
     throw new Error('Ocorreu um erro ao ativar a conta do usuário.');
  }
}


/**
 * Processes a one-time activation token, marks it as used, and activates the user's account.
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
    const batch = writeBatch(db);

    // Activate the user account using the central function
    // We are passing a dummy userRef here because activateUserAccount will create its own.
    // This is not ideal but avoids duplicating the date logic.
    // A better refactor would have activateUserAccount only return the data to be written.
    await activateUserAccount(db, user.uid, tokenDuration);

    // Mark token as used
    batch.update(tokenRef, {
      isUsed: true,
      usedBy: user.email,
      usedAt: new Date(),
    });

    await batch.commit();

  } catch (error) {
    console.error("Error redeeming token:", error);
    // This could be a permissions error, which should be handled by Firestore rules
    throw new Error('Ocorreu um erro ao ativar a conta. Verifique suas permissões.');
  }
}
