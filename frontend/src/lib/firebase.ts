import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 1. Initialize App
const app = initializeApp(firebaseConfig);

// 2. Initialize App Check (With Debug Logs)
if (typeof window !== "undefined") {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (siteKey && siteKey !== "YOUR_RECAPTCHA_PUBLIC_KEY") {
    try {
      // Create a global debug token for localhost testing
      // (Optional: useful if you get 403 errors on localhost)
      // (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;

      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log(
        "✅ App Check: SUCCESS. Initialized with key:",
        siteKey.substring(0, 5) + "..."
      );
    } catch (error) {
      console.error("❌ App Check: FAILED to initialize.", error);
    }
  } else {
    console.warn("⚠️ App Check: SKIPPED. Key not found in .env.local");
    console.log("Current Key Value:", siteKey); // This will print 'undefined' if missing
  }
}

// 3. Initialize Services
// (Keeps your 'long polling' fix intact)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const storage = getStorage(app);
export const auth = getAuth(app);
export const isFirebaseConfigured = true;
