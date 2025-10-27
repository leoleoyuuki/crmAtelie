
'use client';

// A unique object to identify our custom error
const FIRESTORE_PERMISSION_ERROR_IDENTIFIER = 'FIRESTORE_PERMISSION_ERROR_IDENTIFIER';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

// Custom error class that includes all necessary context for debugging
export class FirestorePermissionError extends Error {
  __id: typeof FIRESTORE_PERMISSION_ERROR_IDENTIFIER;
  context: SecurityRuleContext;
  fullMessage: string; // The fully detailed message for developers

  constructor(context: SecurityRuleContext) {
    const baseMessage = 'FirestoreError: Missing or insufficient permissions.';
    super(baseMessage);
    
    this.name = 'FirestorePermissionError';
    this.__id = FIRESTORE_PERMISSION_ERROR_IDENTIFIER;
    this.context = context;

    // Construct a detailed JSON object string for the dev overlay
    this.fullMessage = `${baseMessage} The following request was denied by Firestore Security Rules:\n${JSON.stringify(
      {
        auth: 'Please check the auth object in the browser console for user details.',
        ...context,
      },
      null,
      2
    )}`;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}

// Type guard to check if an error is our custom permission error
export function isFirestorePermissionError(error: any): error is FirestorePermissionError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '__id' in error &&
    error.__id === FIRESTORE_PERMISSION_ERROR_IDENTIFIER
  );
}
