import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import { communityCorrelations, percentilesFor, populationCount } from "@/lib/population";
import { getInsights, lockedInsightCount, type InsightKind } from "@/lib/insights";
import { TRAITS } from "@/lib/traits";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("insights") };
}

const KIND_META: Record<InsightKind, { emoji: string; border: string; text: string }> = {
  fortaleza: { emoji: "✨", border: "border-good/30", text: "text-good" },
  riesgo: { emoji: "⚠️", border: "border-bad/30", text: "text-bad" },
  curiosidad: { emoji: "🔍", border: "border-sky/30", text: "text-sky" },
};

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  // `redirect` de next-intl no está tipado como `never`; guard explícito.
  if (!session?.user?.id) {
    redirect({ href: "/login?next=%2Finsights", locale });
    return null;
  }
  const userId = session.user.id;

  const [t, ti, tr] = await Promise.all([
    getTranslations("insightsPage"),
    getTranslations("insights"),
    getTranslations("traits"),
  ]);

  const profile = await loadProfile(userId);
  if (Object.keys(profile).length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-4 text-5xl">🔍</div>
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

  const [percentiles, correlations, popCount] = await Promise.all([
    percentilesFor(profile),
    communityCorrelations(),
    populationCount(),
  ]);
  const insights = getInsights(profile);
  const locked = lockedInsightCount(profile);
  const population = popCount.toLocaleString(locale);

  // Lo más distintivo del usuario: rasgos con percentil más extremo.
  const extremes = Object.entries(percentiles)
    .map(([trait, p]) => ({ trait, p, dist: Math.abs(p - 50) }))
    .sort((a, b) => b.dist - a.dist)
    .slice(0, 4);

  return (
    <div className="py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("subtitle", { active: insights.length, locked })}</p>
      </header>

      {/* Lo más raro de ti */}
      {extremes.length > 0 && (
        <section className="mb-12 rounded-xl border border-line bg-card p-6">
          <h2 className="font-display mb-1 text-xl">{t("extremesTitle")}</h2>
          <p className="mb-5 text-xs text-muted">{t("extremesSubtitle", { population })}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {extremes.map(({ trait, p }) => {
              const high = p >= 50;
              return (
                <div key={trait} className="rounded-lg border border-line bg-card2 p-4">
                  <p className="text-xs text-muted">{tr(`${trait}.name`)}</p>
                  <p className="font-display my-1 text-3xl">P{p}</p>
                  <p className="text-xs text-muted">
                    {t("extremesBody", {
                      pole: high ? tr(`${trait}.high`) : tr(`${trait}.low`),
                      percent: high ? p : 100 - p,
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Insights por tipo */}
      {(Object.keys(KIND_META) as InsightKind[]).map((kind) => {
        const list = insights.filter((i) => i.kind === kind);
        if (list.length === 0) return null;
        const meta = KIND_META[kind];
        return (
          <section key={kind} className="mb-12">
            <h2 className="font-display mb-5 text-2xl">
              {meta.emoji} {t(kind)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {list.map((i) => (
                <article key={i.id} className={`rounded-xl border bg-card p-6 ${meta.border}`}>
                  <h3 className={`font-display mb-2 text-lg ${meta.text}`}>
                    {ti(`${i.id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{ti(`${i.id}.body`)}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {i.traits.map((x) => (
                      <span
                        key={x}
                        className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted"
                      >
                        {tr(`${x}.short`)} {Math.round(profile[x])}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {/* Correlaciones de la comunidad */}
      {correlations.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display mb-1 text-2xl">{t("correlationsTitle")}</h2>
          <p className="mb-5 text-sm text-muted">{t("correlationsSubtitle", { population })}</p>
          <div className="overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("colTrait")}</th>
                  <th className="px-5 py-3 font-medium">{t("colTrait")}</th>
                  <th className="px-5 py-3 font-medium">{t("colRelation")}</th>
                  <th className="px-5 py-3 text-right font-medium">r</th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((c) => {
                  const pos = c.r > 0;
                  return (
                    <tr key={`${c.a}-${c.b}`} className="border-b border-line/50 last:border-0">
                      {/* nombre completo, no `short`: el eje político
                          «Autoridad» y el fundamento moral «Autoridad» se
                          confunden si se abrevian */}
                      <td className="px-5 py-3">{TRAITS[c.a] ? tr(`${c.a}.name`) : c.a}</td>
                      <td className="px-5 py-3">{TRAITS[c.b] ? tr(`${c.b}.name`) : c.b}</td>
                      <td className="px-5 py-3">
                        <div className="flex h-1.5 w-28 justify-center rounded-full bg-card2">
                          <div
                            className={`h-1.5 rounded-full ${pos ? "bg-good" : "bg-bad"}`}
                            style={{ width: `${Math.min(100, Math.abs(c.r) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-mono ${pos ? "text-good" : "text-bad"}`}
                      >
                        {c.r > 0 ? "+" : ""}
                        {c.r.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {locked > 0 && (
        <section className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
          <p className="mb-4 text-muted">{t("lockedBody", { count: locked })}</p>
          <Link
            href="/tests"
            className="inline-block rounded-lg bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
          >
            {t("lockedCta")}
          </Link>
        </section>
      )}
    </div>
  );
}
