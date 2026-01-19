'use client';

/**
 * Utility function to track Facebook Pixel events.
 * Ensures that the fbq function is available on the window object before tracking.
 * @param eventName The name of the standard event to track (e.g., 'Lead', 'InitiateCheckout').
 * @param data Optional data object for the event.
 */
export const trackFbqEvent = (eventName: string, data?: object) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', eventName, data);
    } else {
        console.warn(`Facebook Pixel not found. Event "${eventName}" was not tracked.`);
    }
};
