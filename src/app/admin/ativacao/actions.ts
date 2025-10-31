
'use server';

import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { TokenDuration } from '@/lib/types';

// This is a simplified and insecure way to generate a random code.
// For a production app, consider a more robust, cryptographically secure method.
const generateRandomCode = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


export async function generateActivationCode(duration: TokenDuration): Promise<string> {
  // In a real app, you'd want to ensure the user calling this is an admin.
  // We're skipping that check for this MVP.
  
  const code = `${generateRandomCode(4)}-${generateRandomCode(4)}-${generateRandomCode(4)}`;

  const tokenData = {
    code,
    duration,
    isUsed: false,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'accessTokens'), tokenData);
    return code;
  } catch (error) {
    console.error("Error creating activation code:", error);
    throw new Error('Failed to save activation code to the database.');
  }
}
