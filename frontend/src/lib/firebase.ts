import { initializeApp } from "firebase/app";
// ✅ 1. Import initializeFirestore instead of just getFirestore
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

// ✅ 2. Use initializeFirestore with experimentalForceLongPolling
export const db = app
  ? initializeFirestore(app, { experimentalForceLongPolling: true })
  : null;

export const storage = app ? getStorage(app) : null; // For Flyer/Photo uploads
export const auth = app ? getAuth(app) : null; // For Admin login
export const isFirebaseConfigured = app !== null;
