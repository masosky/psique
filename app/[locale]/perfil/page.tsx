import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadProfile } from "@/lib/profile";
import { percentilesFor, politicalCloud, populationCount } from "@/lib/population";
import { TESTS } from "@/lib/tests";
import { CATEGORIES, CATEGORY_EMOJI, TRAITS, TRAIT_IDS, type TraitCategory } from "@/lib/traits";
import {
  attachmentStyle,
  bigFiveArchetype,
  darkLevel,
  lockedInsightCount,
  locusLevel,
  moralProfile,
  politicalArchetype,
  pusilanimeIndex,
  selfEsteemLevel,
} from "@/lib/insights";
import { CATEGORY_COLOR } from "@/lib/theme";
import { Compass } from "@/components/charts/Compass";
import { RadarBlock } from "@/components/charts/RadarBlock";
import { TraitBar } from "@/components/charts/TraitBar";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  // Personal, session-bound page: keep it out of search indexes.
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function PerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  // next-intl's `redirect` isn't typed as `never`, so the guard is explicit
  // so TS narrows `session` for the rest of the page.
  if (!session?.user?.id) {
    redirect({ href: "/login?next=%2Fperfil", locale });
    return null;
  }
  const user = session.user;

  const [{ nuevo }, t, tr, tc, ta, tt] = await Promise.all([
    searchParams,
    getTranslations("profile"),
    getTranslations("traits"),
    getTranslations("categories"),
    getTranslations("archetypes"),
    getTranslations("tests"),
  ]);

  const profile = await loadProfile(user.id!);
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const aiAnalysis = dbUser?.aiAnalysis || null;
  const measured = Object.keys(profile);

  if (measured.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-4 text-5xl">🪞</div>
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

  const [percentiles, cloud, popCount] = await Promise.all([
    percentilesFor(profile),
    politicalCloud(),
    populationCount(),
  ]);

  const politico = politicalArchetype(profile);
  const bigFive = bigFiveArchetype(profile);
  const dark = darkLevel(profile);
  const pusi = pusilanimeIndex(profile);
  const apegoStyle = attachmentStyle(profile);
  const moral = moralProfile(profile);
  const esteem = selfEsteemLevel(profile);
  const locusL = locusLevel(profile);
  const locked = lockedInsightCount(profile);
  const nuevoTest = nuevo ? TESTS.find((x) => x.slug === nuevo) : undefined;

  // Registry order, not alphabetical: on the radar it matters that adjacent
  // axes are the theoretically adjacent ones (Schwartz's circle, OCEAN, the
  // 6 political axes in their canonical order).
  const measuredSet = new Set(measured);
  const byCategory = (cat: TraitCategory) =>
    TRAIT_IDS.filter((x) => TRAITS[x].category === cat && measuredSet.has(x));
  const politicos = byCategory("politica");

  const labelsFor = (id: string) => ({
    name: tr(`${id}.name`),
    description: tr(`${id}.description`),
    low: tr(`${id}.low`),
    high: tr(`${id}.high`),
  });

  // The political archetype may carry the "traditional" nuance.
  const politicoName = politico
    ? politico.traditional
      ? ta("traditionalSuffix", { name: ta(`political.${politico.key}.name`) })
      : ta(`political.${politico.key}.name`)
    : null;

  return (
    <div className="py-12">
      {nuevoTest && (
        <div className="mb-8 rounded-xl border border-good/30 bg-good/10 px-5 py-4 text-sm">
          <strong className="text-good">
            {t("justCompleted", { test: tt(`${nuevoTest.slug}.title`) })}
          </strong>{" "}
          <span className="text-muted">
            {t("justCompletedBody", { count: nuevoTest.traits.length })}
          </span>
        </div>
      )}

      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">
            {user.name ? t("titleNamed", { name: user.name }) : t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t("subtitle", {
              measured: measured.length,
              total: TRAIT_IDS.length,
              population: popCount.toLocaleString(locale),
            })}
          </p>
        </div>
        <Link
          href="/insights"
          className="rounded-lg bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
        >
          {t("ctaInsights")}
        </Link>
      </header>

      <section className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-6 shadow-sm">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl text-accent">
            <span>✨</span> {t("aiTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("aiSubtitle")}</p>
        </div>
        <Link
          href="/analisis"
          className="flex items-center gap-2 rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent shadow"
        >
          <span>{t("aiGenerate")}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* Headlines */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        {bigFive && (
          <div className="rounded-xl border border-accent/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-accent uppercase">{t("bigFiveLabel")}</p>
            <p className="font-display text-2xl">{ta(`bigfive.${bigFive.key}.name`)}</p>
            <p className="mt-1 text-sm text-muted">{ta(`bigfive.${bigFive.key}.description`)}</p>
            <p className="mt-2 text-xs text-muted">
              {t("bigFiveTop", { trait: tr(`${bigFive.dominant}.name`) })}
            </p>
          </div>
        )}
        {politico && (
          <div className="rounded-xl border border-sky/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-sky uppercase">{t("archetypeLabel")}</p>
            <p className="font-display text-2xl">{politicoName}</p>
            <p className="mt-1 text-sm text-muted">{ta(`political.${politico.key}.description`)}</p>
          </div>
        )}
        {dark && (
          <div className="rounded-xl border border-bad/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-bad uppercase">
              {t("darkLabel", { score: dark.score })}
            </p>
            <p className="font-display text-2xl">{ta(`dark.${dark.tier}.name`)}</p>
            <p className="mt-1 text-sm text-muted">{ta(`dark.${dark.tier}.description`)}</p>
          </div>
        )}
        {pusi && (
          <div className="rounded-xl border border-amber/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-amber uppercase">
              {t("pusiLabel", { score: pusi.score })}
            </p>
            <p className="font-display text-2xl">{ta(`pusilanime.${pusi.tier}.name`)}</p>
            <p className="mt-1 text-sm text-muted">{ta(`pusilanime.${pusi.tier}.description`)}</p>
          </div>
        )}
        {apegoStyle && (
          <div className="rounded-xl border border-accent/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-accent uppercase">
              {t("attachmentLabel")}
            </p>
            <p className="font-display text-2xl">{ta(`attachment.${apegoStyle.key}.name`)}</p>
            <p className="mt-1 text-sm text-muted">
              {ta(`attachment.${apegoStyle.key}.description`)}
            </p>
          </div>
        )}
        {moral && (
          <div className="rounded-xl border border-good/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-good uppercase">{t("moralLabel")}</p>
            <p className="font-display text-2xl">{ta(`moral.${moral.key}.name`)}</p>
            <p className="mt-1 text-sm text-muted">{ta(`moral.${moral.key}.description`)}</p>
            <p className="mt-2 text-xs text-muted">
              {t("moralTop", { trait: tr(`${moral.top}.name`) })}
            </p>
          </div>
        )}
        {esteem && (
          <div className="rounded-xl border border-sky/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-sky uppercase">
              {t("esteemLabel", { score: esteem.score })}
            </p>
            <p className="font-display text-2xl">{ta(`autoestima.${esteem.tier}.name`)}</p>
            <p className="mt-1 text-sm text-muted">{ta(`autoestima.${esteem.tier}.description`)}</p>
          </div>
        )}
        {locusL && (
          <div className="rounded-xl border border-good/30 bg-card p-5">
            <p className="mb-1 text-xs tracking-wider text-good uppercase">
              {t("locusLabel", { score: locusL.score })}
            </p>
            <p className="font-display text-2xl">{ta(`locus.${locusL.tier}.name`)}</p>
            <p className="mt-1 text-sm text-muted">{ta(`locus.${locusL.tier}.description`)}</p>
          </div>
        )}
      </section>

      {/* Compass + political radar */}
      {politicos.length >= 2 && (
        <section className="mb-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-display mb-1 text-xl">{t("compassTitle")}</h2>
            <p className="mb-5 text-xs text-muted">{t("compassSubtitle")}</p>
            <Compass profile={profile} cloud={cloud} />
          </div>
          <div className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-display mb-1 text-xl">
              {t("axesTitle", { count: politicos.length })}
            </h2>
            <p className="mb-2 text-xs text-muted">{t("axesSubtitle")}</p>
            <RadarBlock
              color={CATEGORY_COLOR.politica}
              data={politicos.map((x) => ({ axis: tr(`${x}.short`), value: profile[x] }))}
            />
          </div>
        </section>
      )}

      {/* One block per category: a radar when there are enough axes (≥4) for
          the shape to say something, and percentile bars always. When a new
          test is added, its category shows up here without touching anything. */}
      <section className="mb-10">
        <h2 className="font-display mb-1 text-2xl">{t("allTraitsTitle")}</h2>
        <p className="mb-6 text-sm text-muted">{t("allTraitsSubtitle")}</p>
        <div className="space-y-4">
          {CATEGORIES.filter((cat) => cat !== "politica").map((cat) => {
            const traits = byCategory(cat);
            if (traits.length === 0) return null;
            const withRadar = traits.length >= 4;
            return (
              <div key={cat} className={withRadar ? "grid gap-4 lg:grid-cols-2" : ""}>
                {withRadar && (
                  <div className="rounded-xl border border-line bg-card p-6">
                    <h3 className="font-display mb-4 text-xl">
                      {CATEGORY_EMOJI[cat]} {tc(cat)}
                    </h3>
                    <RadarBlock
                      color={CATEGORY_COLOR[cat]}
                      data={traits.map((x) => ({ axis: tr(`${x}.short`), value: profile[x] }))}
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center gap-5 rounded-xl border border-line bg-card p-6">
                  {!withRadar && (
                    <h3 className="text-sm font-medium">
                      {CATEGORY_EMOJI[cat]} {tc(cat)}
                    </h3>
                  )}
                  {traits.map((x) => (
                    <TraitBar
                      key={x}
                      trait={x}
                      score={profile[x]}
                      labels={labelsFor(x)}
                      percentile={percentiles[x]}
                      percentileTooltip={t("percentileTooltip", {
                        percentile: percentiles[x] ?? 0,
                      })}
                      color={CATEGORY_COLOR[cat]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* What's missing */}
      {locked > 0 && (
        <section className="rounded-xl border border-accent/30 bg-accent/5 p-6">
          <h2 className="font-display mb-2 text-xl">{t("lockedTitle", { count: locked })}</h2>
          <p className="mb-5 text-sm text-muted">{t("lockedBody")}</p>
          <div className="flex flex-wrap gap-2">
            {TESTS.filter((x) => x.traits.some((tr2) => profile[tr2] === undefined)).map((x) => (
              <Link
                key={x.slug}
                href={`/tests/${x.slug}`}
                className="rounded-lg border border-line bg-card px-4 py-2 text-sm transition hover:border-accent"
              >
                {x.emoji} {tt(`${x.slug}.title`)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
