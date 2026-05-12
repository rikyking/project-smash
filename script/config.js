/**
 * Firebase Configuration Module
 * Loads Firebase credentials from environment variables
 * Environment variables should be set in .env.local (not committed to git)
 */

export function getFirebaseConfig() {
  // Check if we're in a browser environment with window object
  if (typeof window === 'undefined') {
    throw new Error('Firebase config must be loaded in browser environment');
  }

  // Try to read from window.__FIREBASE_CONFIG__ (set by build process)
  if (window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  // Fallback: Read from environment variables
  // In a real app, you'd use a build tool (Vite, Webpack, etc.) to inject these
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Validate that all required fields are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    console.error(
      'Missing Firebase configuration fields:',
      missingFields.join(', '),
      '\nPlease create a .env.local file with all required Firebase credentials.'
    );
    throw new Error(
      `Missing Firebase configuration: ${missingFields.join(', ')}. ` +
      'See .env.example for required fields.'
    );
  }

  return config;
}

export function getAppId() {
  return import.meta.env.VITE_APP_ID || 'default-app-id';
}

export function getAdminRole() {
  return 'admin';
}
