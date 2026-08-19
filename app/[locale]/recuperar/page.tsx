"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { authErrorKey, firebaseAuth } from "@/lib/firebase";

export default function RecuperarPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSent(true);
    } catch (err) {
      const key = authErrorKey(err);
      // Never reveal whether an address is registered: an unknown email gets
      // the same confirmation as a known one (avoids account enumeration).
      if (key === "badCredentials") {
        setSent(true);
      } else {
        setError(key ? t(key) : t("resetFailed"));
      }
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="font-display mb-2 text-3xl">{t("resetTitle")}</h1>
      <p className="mb-8 text-sm text-muted">{t("resetSubtitle")}</p>

      {sent ? (
        <div className="rounded-lg border border-good/30 bg-good/10 p-5 text-sm">
          <p className="mb-1 font-medium text-good">{t("resetSentTitle")}</p>
          <p className="text-muted">{t("resetSentBody", { email })}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
          {error && <p className="text-sm text-bad">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-accent-strong py-3 font-medium text-white transition hover:bg-accent disabled:opacity-50"
          >
            {loading ? t("resetLoading") : t("resetButton")}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
