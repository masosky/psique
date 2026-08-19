// Client-side Firebase initialization. Import ONLY from client components:
// Firebase Auth handles identity (email/password, Google, password reset);
// the resulting ID token is exchanged for a NextAuth session in lib/auth.ts.
import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./firebase-config";

// Guard against re-init on HMR / multiple imports.
const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics only where the browser supports it (no-op on server/unsupported).
if (typeof window !== "undefined") {
  isSupported().then((ok) => ok && getAnalytics(app));
}

// Firebase Auth error code → auth.* message key. Anything not listed falls
// back to the caller's generic error.
export const AUTH_ERROR_KEYS: Record<string, string> = {
  "auth/invalid-email": "errInvalidEmail",
  "auth/weak-password": "errWeakPassword",
  "auth/email-already-in-use": "errEmailTaken",
  "auth/invalid-credential": "badCredentials",
  "auth/wrong-password": "badCredentials",
  "auth/user-not-found": "badCredentials",
  "auth/too-many-requests": "errTooManyRequests",
  "auth/popup-closed-by-user": "errPopupClosed",
  "auth/network-request-failed": "errNetwork",
  "auth/operation-not-allowed": "errProviderDisabled",
};

export function authErrorKey(e: unknown): string | undefined {
  const code = (e as { code?: string })?.code;
  return code ? AUTH_ERROR_KEYS[code] : undefined;
}
