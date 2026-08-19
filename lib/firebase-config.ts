// Firebase web app configuration, read from NEXT_PUBLIC_FIREBASE_* env vars.
//
// These values reach the browser bundle by design (they identify the project,
// they don't grant access — security lives in Firebase rules and in the
// ID-token verification in lib/auth.ts). They live in .env rather than in
// code so the repo carries no project-specific values and so staging and
// production can point at different Firebase projects.
//
// Plain object with no imports: consumed by the browser SDK init
// (lib/firebase.ts) and by the server-side token verifier (lib/auth.ts),
// which only needs `projectId`.
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.template to .env and fill in the Firebase config.`);
  }
  return value;
}

export const firebaseConfig = {
  apiKey: required("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: required(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: required(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: required("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;
