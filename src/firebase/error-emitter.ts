
'use client';

import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

// Define the types for the events you want to emit
interface ErrorEvents {
  'permission-error': (error: FirestorePermissionError) => void;
}

// Extend EventEmitter with your defined types
declare interface ErrorEventEmitter {
  on<U extends keyof ErrorEvents>(event: U, listener: ErrorEvents[U]): this;
  emit<U extends keyof ErrorEvents>(event: U, ...args: Parameters<ErrorEvents[U]>): boolean;
}

class ErrorEventEmitter extends EventEmitter {}

// Create and export a singleton instance of the emitter
export const errorEmitter = new ErrorEventEmitter();
