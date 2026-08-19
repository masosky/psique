import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { loadSharedResult } from "@/lib/share";
import { BRAND_WORDMARK, MARK } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; shareId: string }>;
}) {
  const { locale, shareId } = await params;
  const [t, shared] = await Promise.all([
    getTranslations({ locale, namespace: "share" }),
    loadSharedResult(shareId),
  ]);
  if (!shared) return { robots: { index: false, follow: false } };

  const title = shared.name ? t("metaTitleNamed", { name: shared.name }) : t("metaTitle");
  return {
    title,
    description: t("metaDescription"),
    // Someone else's results: never indexable. Link previews still work —
    // WhatsApp and X read Open Graph tags regardless of robots.
    robots: { index: false, follow: false },
    openGraph: { title, description: t("metaDescription") },
  };
}

// Public result page. Everything on it passed through the owner's consent
// flags in lib/share.ts, so nothing here needs further filtering.
export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ locale: string; shareId: string }>;
}) {
  const { locale, shareId } = await params;
  setRequestLocale(locale);

  const shared = await loadSharedResult(shareId);
  if (!shared) notFound();

  const [t, ta, tr] = await Promise.all([
    getTranslations("share"),
    getTranslations("archetypes"),
    getTranslations("traits"),
  ]);

  const politicalName =
    shared.political &&
    (shared.political.traditional
      ? ta("traditionalSuffix", { name: ta(`political.${shared.political.key}.name`) })
      : ta(`political.${shared.political.key}.name`));

  const cards = [
    politicalName && {
      key: "political",
      label: t("labelPolitical"),
      name: politicalName,
      body: ta(`political.${shared.political!.key}.description`),
      tone: "border-sky/30",
    },
    shared.esteem && {
      key: "esteem",
      label: t("labelEsteem", { score: shared.esteem.score }),
      name: ta(`autoestima.${shared.esteem.tier}.name`),
      body: ta(`autoestima.${shared.esteem.tier}.description`),
      tone: "border-accent/30",
    },
    shared.attachment && {
      key: "attachment",
      label: t("labelAttachment"),
      name: ta(`attachment.${shared.attachment.key}.name`),
      body: ta(`attachment.${shared.attachment.key}.description`),
      tone: "border-accent/30",
    },
    shared.dark && {
      key: "dark",
      label: t("labelDark", { score: shared.dark.score }),
      name: ta(`dark.${shared.dark.tier}.name`),
      body: ta(`dark.${shared.dark.tier}.description`),
      tone: "border-bad/30",
    },
    shared.pusilanime && {
      key: "pusilanime",
      label: t("labelPusilanime", { score: shared.pusilanime.score }),
      name: ta(`pusilanime.${shared.pusilanime.tier}.name`),
      body: ta(`pusilanime.${shared.pusilanime.tier}.description`),
      tone: "border-amber/30",
    },
    shared.moral && {
      key: "moral",
      label: t("labelMoral"),
      name: ta(`moral.${shared.moral.key}.name`),
      body: t("moralTop", { trait: tr(`${shared.moral.top}.name`) }),
      tone: "border-good/30",
    },
    shared.locus && {
      key: "locus",
      label: t("labelLocus", { score: shared.locus.score }),
      name: ta(`locus.${shared.locus.tier}.name`),
      body: ta(`locus.${shared.locus.tier}.description`),
      tone: "border-good/30",
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    name: string;
    body: string;
    tone: string;
  }[];

  return (
    <div className="py-14">
      <header className="mb-10 text-center">
        <svg viewBox={MARK.viewBox} className="mx-auto mb-5 h-10 w-10 fill-accent" aria-hidden>
          {MARK.wings.map((d) => (
            <path key={d} d={d} />
          ))}
          <ellipse cx={MARK.body.cx} cy={MARK.body.cy} rx={MARK.body.rx} ry={MARK.body.ry} />
        </svg>
        <h1 className="font-display text-4xl">
          {shared.name ? t("titleNamed", { name: shared.name }) : t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle", { traits: shared.traitCount })}</p>
      </header>

      <section className="mb-12 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className={`rounded-xl border bg-card p-5 ${c.tone}`}>
            <p className="mb-1 text-xs tracking-wider text-muted uppercase">{c.label}</p>
            <p className="font-display text-2xl">{c.name}</p>
            <p className="mt-1 text-sm text-muted">{c.body}</p>
          </div>
        ))}
      </section>

      <div className="rounded-xl border border-line bg-card p-8 text-center">
        <h2 className="font-display mb-2 text-2xl">{t("ctaTitle")}</h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-muted">{t("ctaBody")}</p>
        <Link
          href="/registro"
          className="inline-block rounded-lg bg-accent-strong px-6 py-3 font-medium text-white transition hover:bg-accent"
        >
          {t("ctaButton", { brand: BRAND_WORDMARK })}
        </Link>
      </div>
    </div>
  );
}
