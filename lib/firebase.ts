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
  "auth/network-request-failed": "errNetwork",
  "auth/operation-not-allowed": "errProviderDisabled",
  "auth/popup-blocked": "errPopupBlocked",
  "auth/account-exists-with-different-credential": "errAccountExists",
  // Deployment mistake, not a user mistake: the domain is missing from
  // Firebase console → Authentication → Settings → Authorized domains.
  "auth/unauthorized-domain": "errUnauthorizedDomain",
};

// Codes that mean "the user changed their mind" — no error should be shown.
const SILENT_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

const codeOf = (e: unknown): string | undefined => (e as { code?: string })?.code;

export const isSilentAuthError = (e: unknown): boolean => SILENT_CODES.has(codeOf(e) ?? "");

export function authErrorKey(e: unknown): string | undefined {
  const code = codeOf(e);
  const key = code ? AUTH_ERROR_KEYS[code] : undefined;
  // Without this, an unmapped code shows a generic message and leaves no
  // trace of what actually failed.
  if (!key && code) console.error(`Unhandled Firebase auth error: ${code}`, e);
  return key;
}
