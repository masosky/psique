import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTest, TESTS } from "@/lib/tests";
import { TestSources } from "@/components/TestSources";
import { jsonLd, localeAlternates, SITE_NAME, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => TESTS.map((t) => ({ locale, slug: t.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!getTest(slug)) return {};
  const t = await getTranslations({ locale, namespace: "tests" });
  return {
    title: t(`${slug}.title`),
    description: t(`${slug}.tagline`),
    alternates: localeAlternates(locale, `/tests/${slug}`),
    openGraph: {
      title: t(`${slug}.title`),
      description: t(`${slug}.tagline`),
      url: `/${locale}/tests/${slug}`,
    },
  };
}

// Test sheet: what it measures, how long it takes, and what it's based on.
// It's public (no account required) so it's indexable and shareable; login
// is asked for on pressing "start".
export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const test = getTest(slug);
  if (!test) notFound();

  const [session, t, tt, tr, tc] = await Promise.all([
    auth(),
    getTranslations("testsPage"),
    getTranslations("tests"),
    getTranslations("traits"),
    getTranslations("categories"),
  ]);

  const done = session?.user?.id
    ? ((await prisma.testAttempt.count({
        where: { userId: session.user.id, testSlug: slug },
      })) ?? 0) > 0
    : false;

  const notes = test.sources.map((s) => tt(`${slug}.sources.${s.noteKey}`));
  const startHref = session?.user
    ? `/tests/${slug}/responder`
    : `/login?next=${encodeURIComponent(`/tests/${slug}/responder`)}`;

  // Structured data: the test as a schema.org Quiz plus its breadcrumb trail.
  const pageUrl = `${SITE_URL}/${locale}/tests/${slug}`;
  const structuredData = jsonLd({
    "@graph": [
      {
        "@type": "Quiz",
        name: tt(`${slug}.title`),
        description: tt(`${slug}.description`),
        url: pageUrl,
        inLanguage: locale,
        isAccessibleForFree: true,
        timeRequired: `PT${test.minutes}M`,
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: t("title"), item: `${SITE_URL}/${locale}/tests` },
          { "@type": "ListItem", position: 3, name: tt(`${slug}.title`), item: pageUrl },
        ],
      },
    ],
  });

  return (
    <div className="mx-auto max-w-2xl py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <Link href="/tests" className="text-sm text-muted transition hover:text-fg">
        ← {t("title")}
      </Link>

      <header className="mt-6 mb-8">
        <div className="mb-4 text-5xl">{test.emoji}</div>
        <h1 className="font-display text-4xl">{tt(`${slug}.title`)}</h1>
        <p className="mt-2 text-lg text-accent">{tt(`${slug}.tagline`)}</p>
        <p className="mt-5 leading-relaxed text-muted">{tt(`${slug}.description`)}</p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href={startHref}
          className="rounded-lg bg-accent-strong px-6 py-3 font-medium text-white transition hover:bg-accent"
        >
          {done ? t("repeat") : t("start")}
        </Link>
        <span className="text-sm text-muted">
          {t("meta", { items: test.items.length, minutes: test.minutes })}
        </span>
        {done && (
          <span className="rounded-full border border-good/40 bg-good/10 px-2.5 py-0.5 text-xs text-good">
            {t("completed")}
          </span>
        )}
      </div>

      {/* What it measures */}
      <section className="mb-8 rounded-xl border border-line bg-card p-6">
        <h3 className="font-display mb-4 text-lg">
          {tc(test.category)} · {test.traits.length}
        </h3>
        <ul className="space-y-3">
          {test.traits.map((trait) => (
            <li key={trait}>
              <p className="text-sm font-medium">{tr(`${trait}.name`)}</p>
              <p className="text-xs text-muted">{tr(`${trait}.description`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <TestSources
        sources={test.sources}
        title={t("sourcesTitle")}
        intro={t("sourcesIntro")}
        notes={notes}
      />
    </div>
  );
}
