import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import { percentilesFor, politicalCloud, populationCount } from "@/lib/population";
import { TESTS } from "@/lib/tests";
import { CATEGORIES, CATEGORY_EMOJI, TRAITS, TRAIT_IDS, type TraitCategory } from "@/lib/traits";
import {
  attachmentStyle,
  darkLevel,
  lockedInsightCount,
  moralProfile,
  politicalArchetype,
  pusilanimeIndex,
} from "@/lib/insights";
import { Compass } from "@/components/charts/Compass";
import { RadarBlock } from "@/components/charts/RadarBlock";
import { TraitBar } from "@/components/charts/TraitBar";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("title") };
}

const CATEGORY_COLOR: Record<TraitCategory, string> = {
  politica: "#38bdf8",
  personalidad: "#a78bfa",
  moral: "#34d399",
  valores: "#f0abfc",
  vinculos: "#fb7185",
  oscuro: "#f87171",
  caracter: "#fbbf24",
};

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
  // `redirect` de next-intl no está tipado como `never`, así que el guard es
  // explícito para que TS estreche `session` en el resto de la página.
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
  const dark = darkLevel(profile);
  const pusi = pusilanimeIndex(profile);
  const apegoStyle = attachmentStyle(profile);
  const moral = moralProfile(profile);
  const locked = lockedInsightCount(profile);
  const nuevoTest = nuevo ? TESTS.find((x) => x.slug === nuevo) : undefined;

  // Orden del registro, no alfabético: en el radar importa que los ejes
  // adyacentes sean los teóricamente adyacentes (círculo de Schwartz, OCEAN,
  // los 6 ejes políticos en su orden canónico).
  const measuredSet = new Set(measured);
  const byCategory = (cat: TraitCategory) =>
    TRAIT_IDS.filter((x) => TRAITS[x].category === cat && measuredSet.has(x));
  const politicos = byCategory("politica");

  const labelsFor = (id: string) => ({
    name: tr(`${id}.name`),
    low: tr(`${id}.low`),
    high: tr(`${id}.high`),
  });

  // El arquetipo político puede llevar el matiz "tradicional".
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

      {/* Titulares */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
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
      </section>

      {/* Brújula + radar político */}
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
              color="#38bdf8"
              data={politicos.map((x) => ({ axis: tr(`${x}.short`), value: profile[x] }))}
            />
          </div>
        </section>
      )}

      {/* Un bloque por categoría: radar cuando hay suficientes ejes (≥4) para
          que la forma diga algo, y barras con percentil siempre. Al añadir un
          test nuevo, su categoría aparece aquí sin tocar nada. */}
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

      {/* Qué falta */}
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
