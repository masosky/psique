import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { TESTS } from "@/lib/tests";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studies" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: localeAlternates(locale, "/estudios"),
    openGraph: { title: t("title"), description: t("subtitle"), url: `/${locale}/estudios` },
  };
}

// Google Scholar search by citation, as an alternative to the DOI (some
// DOIs lead to a paywall; Scholar usually finds an accessible version).
const scholar = (citation: string) =>
  `https://scholar.google.com/scholar?q=${encodeURIComponent(citation)}`;

// Public catalog of everything behind the tests. It's the page that answers
// "is this serious or is it a horoscope?".
export default async function EstudiosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tt] = await Promise.all([getTranslations("studies"), getTranslations("tests")]);
  const total = TESTS.reduce((a, x) => a + x.sources.length, 0);

  return (
    <div className="py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-muted">{t("subtitle")}</p>
        <p className="mt-4 text-sm text-muted">
          {t("count", { studies: total, tests: TESTS.length })}
        </p>
      </header>

      <div className="mb-10 rounded-xl border border-amber/30 bg-amber/5 p-5 text-sm text-muted">
        <strong className="text-amber">{t("caveatTitle")}</strong> {t("caveatBody")}
      </div>

      <div className="space-y-10">
        {TESTS.map((test) => (
          <section key={test.slug}>
            <div className="mb-4 flex flex-wrap items-baseline gap-3">
              <h2 className="font-display text-2xl">
                {test.emoji} {tt(`${test.slug}.title`)}
              </h2>
              <Link
                href={`/tests/${test.slug}`}
                className="text-sm text-accent transition hover:underline"
              >
                {t("goToTest")}
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {test.sources.map((s) => (
                <article
                  key={s.url}
                  className="flex flex-col rounded-xl border border-line bg-card p-5 transition hover:border-accent/50"
                >
                  <p className="flex-1 text-sm leading-snug font-medium">{s.citation}</p>
                  <p className="mt-2 text-xs text-muted">
                    {tt(`${test.slug}.sources.${s.noteKey}`)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-line px-2.5 py-1 text-accent transition hover:border-accent"
                    >
                      {s.url.includes("doi.org") ? t("doi") : t("source")} ↗
                    </a>
                    <a
                      href={scholar(s.citation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-line px-2.5 py-1 text-muted transition hover:border-accent hover:text-fg"
                    >
                      {t("scholar")} ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
