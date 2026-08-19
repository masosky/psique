"use client";

import { signInWithPopup } from "firebase/auth";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { authErrorKey, firebaseAuth, googleProvider } from "@/lib/firebase";

// Google sign-in: Firebase popup for identity, then the ID token is exchanged
// for a NextAuth session. Used on both the login and signup pages — with
// Google there is no difference between the two.
export function GoogleButton({
  onError,
  onStart,
  disabled,
  next,
}: {
  onError: (message: string) => void;
  onStart: () => void;
  disabled?: boolean;
  next: string;
}) {
  const t = useTranslations("auth");

  async function onClick() {
    onStart();
    try {
      const cred = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await signIn("firebase", {
        idToken,
        name: cred.user.displayName ?? "",
        redirect: false,
      });
      if (res?.error) {
        onError(t("badCredentials"));
        return;
      }
      // Full reload so the server components pick up the new session.
      window.location.href = next;
    } catch (e) {
      const key = authErrorKey(e);
      // Closing the popup is a deliberate cancel, not an error worth showing.
      if (key === "errPopupClosed") {
        onError("");
        return;
      }
      onError(key ? t(key) : t("errGoogle"));
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-card py-3 text-sm font-medium transition hover:border-accent hover:bg-card2 disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"
        />
        <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5z"
        />
      </svg>
      {t("googleButton")}
    </button>
  );
}
