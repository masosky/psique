"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export interface RunnerItem {
  id: string;
  text: string;
}

export function TestRunner({
  slug,
  emoji,
  title,
  items,
}: {
  slug: string;
  emoji: string;
  title: string;
  items: RunnerItem[];
}) {
  const t = useTranslations("runner");
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const item = items[index];
  const isLast = index === items.length - 1;
  const progress = (Object.keys(answers).length / items.length) * 100;

  const submit = useCallback(
    async (final: Record<string, number>) => {
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testSlug: slug, answers: final }),
      });
      if (!res.ok) {
        // El detalle del server (errores de scoring) no está localizado y en el
        // flujo normal de la UI no puede darse: mensaje genérico traducido.
        setError(t("submitError"));
        setSubmitting(false);
        return;
      }
      router.push(`/perfil?nuevo=${slug}`);
      router.refresh();
    },
    [router, slug, t],
  );

  const answer = useCallback(
    (value: number) => {
      if (submitting) return;
      const next = { ...answers, [item.id]: value };
      setAnswers(next);
      if (isLast) {
        if (Object.keys(next).length === items.length) void submit(next);
        else setIndex(items.findIndex((i) => next[i.id] === undefined));
      } else {
        setIndex(index + 1);
      }
    },
    [answers, index, isLast, item.id, items, submit, submitting],
  );

  // Atajos: 1-5 responde, ← vuelve atrás.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "1" && e.key <= "5") answer(Number(e.key));
      if (e.key === "ArrowLeft" && index > 0) setIndex(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, index]);

  return (
    <div className="mx-auto max-w-2xl py-10">
      {/* progreso */}
      <div className="mb-10">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>
            {emoji} {title}
          </span>
          <span>{t("progress", { current: index + 1, total: items.length })}</span>
        </div>
        <div className="h-1 rounded-full bg-card2">
          <div
            className="h-1 rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="font-display mb-10 min-h-[5rem] text-center text-2xl leading-snug text-balance sm:text-3xl">
        {item.text}
      </p>

      <div className="space-y-2">
        {([1, 2, 3, 4, 5] as const).map((value) => {
          const selected = answers[item.id] === value;
          return (
            <button
              key={value}
              onClick={() => answer(value)}
              disabled={submitting}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition disabled:opacity-50 ${
                selected
                  ? "border-accent bg-accent/15 text-fg"
                  : "border-line bg-card text-muted hover:border-accent/60 hover:bg-card2 hover:text-fg"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-line font-mono text-[11px] text-muted">
                {value}
              </span>
              {t(`opt${value}`)}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-4 text-center text-sm text-bad">{error}</p>}
      {submitting && <p className="mt-6 text-center text-sm text-accent">{t("submitting")}</p>}

      <div className="mt-8 flex items-center justify-between text-xs text-muted">
        <button
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="transition hover:text-fg disabled:opacity-30"
        >
          {t("previous")}
        </button>
        <span className="hidden sm:inline">{t("keyboardHint")}</span>
      </div>
    </div>
  );
}
