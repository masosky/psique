import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { firstAttemptAt, loadHistory, MEANINGFUL_DELTA } from "@/lib/history";
import { SERIES_COLORS } from "@/lib/theme";
import { EvolutionChart } from "@/components/charts/EvolutionChart";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "evolution" });
  // Personal, session-bound page: keep it out of search indexes.
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** Traits drawn as lines: more than this and the chart turns into spaghetti. */
const MAX_SERIES = 6;

export default async function EvolucionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  // next-intl's `redirect` isn't typed as `never`; explicit guard.
  if (!session?.user?.id) {
    redirect({ href: "/login?next=%2Fevolucion", locale });
    return null;
  }

  const [t, tr, history, since] = await Promise.all([
    getTranslations("evolution"),
    getTranslations("traits"),
    loadHistory(session.user.id),
    firstAttemptAt(session.user.id),
  ]);

  // History only exists for traits whose test has been taken more than once.
  if (history.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-4 text-5xl">📈</div>
        <h1 className="font-display mb-3 text-3xl">{t("emptyTitle")}</h1>
        <p className="mx-auto mb-8 max-w-md text-muted">{t("emptyBody")}</p>
        <Link
          href="/tests"
          className="rounded-lg bg-accent-strong px-6 py-3 font-medium text-white transition hover:bg-accent"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  const movers = history.filter((h) => Math.abs(h.delta) >= MEANINGFUL_DELTA);
  const series = history.slice(0, MAX_SERIES).map((h, i) => ({
    trait: h.trait,
    label: tr(`${h.trait}.short`),
    // One color per line, not per category: several traits here usually share
    // a category and would otherwise be drawn identically.
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    points: h.points,
  }));
  const sinceLabel = since
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(since)
    : "";

  return (
    <div className="py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted">
          {t("subtitle", { traits: history.length, since: sinceLabel })}
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-line bg-card p-6">
        <h2 className="font-display mb-1 text-xl">{t("chartTitle", { count: series.length })}</h2>
        <p className="mb-5 text-xs text-muted">{t("chartSubtitle")}</p>
        <EvolutionChart series={series} />
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {series.map((s) => (
            <span key={s.trait} className="flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-1 text-2xl">{t("changesTitle")}</h2>
        <p className="mb-6 text-sm text-muted">
          {movers.length > 0 ? t("changesSubtitle") : t("changesNone")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(movers.length > 0 ? movers : history).map((h) => {
            const up = h.delta > 0;
            const flat = Math.abs(h.delta) < MEANINGFUL_DELTA;
            return (
              <div key={h.trait} className="rounded-xl border border-line bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{tr(`${h.trait}.name`)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {t("measurements", { count: h.points.length })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${
                      flat
                        ? "border border-line text-muted"
                        : up
                          ? "border border-good/40 bg-good/10 text-good"
                          : "border border-bad/40 bg-bad/10 text-bad"
                    }`}
                  >
                    {flat ? t("stable") : `${up ? "+" : ""}${Math.round(h.delta)}`}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {t("fromTo", {
                    from: Math.round(h.first),
                    to: Math.round(h.last),
                    pole: tr(`${h.trait}.${up ? "high" : "low"}`),
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
