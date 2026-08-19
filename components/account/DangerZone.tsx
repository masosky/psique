"use client";

import { useState } from "react";
import { deleteUser } from "firebase/auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { firebaseAuth } from "@/lib/firebase";

// Export and account deletion: GDPR art. 20 and art. 17 respectively.
export function DangerZone() {
  const t = useTranslations("account");
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyword = t("deleteKeyword");

  async function onDelete() {
    setBusy(true);
    setError(null);
    try {
      // Our data first: it is the copy that actually holds the answers.
      const res = await fetch("/api/me", { method: "DELETE" });
      if (!res.ok) throw new Error();

      // Then the Firebase identity, using the browser's own credential.
      // Firebase refuses this on a stale session, so a failure here means
      // "sign in again and retry" — the profile data is already gone.
      try {
        if (firebaseAuth.currentUser) await deleteUser(firebaseAuth.currentUser);
      } catch {
        /* handled by signing out below; the account has no data left */
      }

      await signOut({ redirectTo: "/" });
    } catch {
      setError(t("deleteError"));
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-bad/30 bg-card p-6">
      <h2 className="font-display mb-1 text-xl">{t("dataTitle")}</h2>
      <p className="mb-5 text-sm text-muted">{t("dataBody")}</p>

      {/* A real anchor, not <Link>: this is a file download driven by
          Content-Disposition, and client-side navigation would swallow it. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/api/me/export"
        className="inline-block rounded-lg border border-line px-4 py-2 text-sm transition hover:border-accent"
      >
        {t("exportButton")}
      </a>

      <hr className="my-6 border-line" />

      <h3 className="mb-1 font-medium text-bad">{t("deleteTitle")}</h3>
      <p className="mb-4 text-sm text-muted">{t("deleteBody")}</p>

      {confirming ? (
        <div className="space-y-3">
          <p className="text-sm">{t("deleteConfirm", { keyword })}</p>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={keyword}
            className="w-full max-w-xs rounded-lg border border-line bg-card2 px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-bad"
          />
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              disabled={busy || typed.trim().toLowerCase() !== keyword.toLowerCase()}
              className="rounded-lg bg-bad px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {busy ? t("deleteLoading") : t("deleteFinal")}
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                setTyped("");
              }}
              disabled={busy}
              className="rounded-lg border border-line px-4 py-2 text-sm transition hover:border-accent"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-bad/40 px-4 py-2 text-sm text-bad transition hover:bg-bad/10"
        >
          {t("deleteButton")}
        </button>
      )}

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}
    </section>
  );
}
