"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// Share opt-in. Politics is a separate tick on purpose: ideology is
// special-category data and needs its own explicit consent.
export function ShareSettings({
  initialShareId,
  initialPolitics,
  hasPolitics,
}: {
  initialShareId: string | null;
  initialPolitics: boolean;
  hasPolitics: boolean;
}) {
  const t = useTranslations("account");
  const locale = useLocale();
  const [shareId, setShareId] = useState(initialShareId);
  const [politics, setPolitics] = useState(initialPolitics);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Built from the browser's own origin rather than a configured base URL:
  // whatever host the user is actually on is the host their link must use.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const url = shareId ? `${origin}/${locale}/r/${shareId}` : null;

  async function save(next: { enabled: boolean; politics: boolean }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/me/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShareId(data.shareId);
      setPolitics(data.politics);
    } catch {
      setError(t("saveError"));
    }
    setSaving(false);
  }

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-xl border border-line bg-card p-6">
      <h2 className="font-display mb-1 text-xl">{t("shareTitle")}</h2>
      <p className="mb-5 text-sm text-muted">{t("shareBody")}</p>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={Boolean(shareId)}
          disabled={saving}
          onChange={(e) => save({ enabled: e.target.checked, politics })}
          className="mt-0.5 h-4 w-4 accent-[var(--color-accent-strong)]"
        />
        <span className="text-sm">{t("shareEnable")}</span>
      </label>

      {shareId && (
        <>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={politics}
              disabled={saving || !hasPolitics}
              onChange={(e) => save({ enabled: true, politics: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[var(--color-accent-strong)]"
            />
            <span className="text-sm">
              {t("sharePolitics")}
              <span className="mt-0.5 block text-xs text-muted">
                {hasPolitics ? t("sharePoliticsHint") : t("sharePoliticsMissing")}
              </span>
            </span>
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-card2 px-3 py-2 text-xs text-muted">
              {url}
            </code>
            <button
              onClick={copy}
              className="rounded-lg border border-line px-4 py-2 text-sm transition hover:border-accent"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}
    </section>
  );
}
