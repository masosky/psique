import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { TESTS } from "@/lib/tests";
import { TRAIT_IDS } from "@/lib/traits";
import { INSIGHT_COUNT } from "@/lib/insights";
import { auth } from "@/lib/auth";
import { jsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [session, t, tt, ts, tm] = await Promise.all([
    auth(),
    getTranslations("home"),
    getTranslations("tests"),
    getTranslations("studies"),
    getTranslations("meta"),
  ]);
  const totalItems = TESTS.reduce((a, x) => a + x.items.length, 0);

  // Structured data for Google: the site plus the app itself (free web app).
  const structuredData = jsonLd({
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        description: tm("description"),
        inLanguage: locale,
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: `${SITE_URL}/${locale}`,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        description: tm("description"),
        inLanguage: locale,
      },
    ],
  });

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      {/* Hero */}
      <section className="py-20 text-center sm:py-28">
        <p className="mb-4 text-sm tracking-widest text-accent uppercase">{t("eyebrow")}</p>
        <h1 className="font-display mx-auto max-w-3xl text-5xl leading-tight tracking-tight text-balance sm:text-6xl">
          {t("title")} <span className="italic">{t("titleEmphasis")}</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href={session?.user ? "/perfil" : "/registro"}
            className="rounded-lg bg-accent-strong px-6 py-3 font-medium text-white transition hover:bg-accent"
          >
            {session?.user ? t("ctaProfile") : t("ctaSignup")}
          </Link>
          <Link
            href="/tests"
            className="rounded-lg border border-line px-6 py-3 font-medium text-muted transition hover:border-accent hover:text-fg"
          >
            {t("ctaTests")}
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted">
          <span>
            <strong className="text-fg">{TESTS.length}</strong> {t("statTests")}
          </span>
          <span className="text-line">·</span>
          <span>
            <strong className="text-fg">{TRAIT_IDS.length}</strong> {t("statTraits")}
          </span>
          <span className="text-line">·</span>
          <span>
            <strong className="text-fg">{INSIGHT_COUNT}</strong> {t("statInsights")}
          </span>
          <span className="text-line">·</span>
          <span>
            <strong className="text-fg">{totalItems}</strong> {t("statQuestions")}
          </span>
        </div>
      </section>

      {/* Tests */}
      <section className="py-12">
        <h2 className="font-display mb-8 text-3xl">{t("testsHeading")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TESTS.map((x) => (
            <Link
              key={x.slug}
              href={`/tests/${x.slug}`}
              className="group rounded-xl border border-line bg-card p-6 transition hover:border-accent/60 hover:bg-card2"
            >
              <div className="mb-3 text-3xl">{x.emoji}</div>
              <h3 className="font-display text-xl group-hover:text-accent">
                {tt(`${x.slug}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted">{tt(`${x.slug}.tagline`)}</p>
              <p className="mt-4 text-xs text-muted">
                {t("testMeta", {
                  items: x.items.length,
                  minutes: x.minutes,
                  traits: x.traits.length,
                })}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="font-display mb-8 text-3xl">{t("howHeading")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="rounded-xl border border-line bg-card p-6">
              <div className="font-display mb-3 text-4xl text-accent italic">{n}</div>
              <h3 className="mb-2 font-medium">{t(`how${n}Title`)}</h3>
              <p className="text-sm text-muted">{t(`how${n}Body`, { traits: TRAIT_IDS.length })}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Credibility */}
      <section className="py-12">
        <div className="rounded-xl border border-line bg-card p-8 text-center">
          <h2 className="font-display mb-3 text-2xl">{ts("homeTitle")}</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-muted">{ts("homeBody")}</p>
          <Link
            href="/estudios"
            className="inline-block rounded-lg border border-line px-5 py-2.5 text-sm text-muted transition hover:border-accent hover:text-fg"
          >
            {ts("homeCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
