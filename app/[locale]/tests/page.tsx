import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TESTS } from "@/lib/tests";
import { TRAIT_IDS } from "@/lib/traits";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "testsPage" });
  return { title: t("title") };
}

export default async function TestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [session, t, tt] = await Promise.all([
    auth(),
    getTranslations("testsPage"),
    getTranslations("tests"),
  ]);

  let doneSlugs = new Set<string>();
  let measured = 0;
  if (session?.user?.id) {
    const [attempts, scores] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { userId: session.user.id },
        select: { testSlug: true },
        distinct: ["testSlug"],
      }),
      prisma.traitScore.count({ where: { userId: session.user.id } }),
    ]);
    doneSlugs = new Set(attempts.map((a) => a.testSlug));
    measured = scores;
  }

  return (
    <div className="py-12">
      <h1 className="font-display mb-2 text-4xl">{t("title")}</h1>
      <p className="mb-10 text-muted">
        {session?.user
          ? t("subtitleAuthed", { measured, total: TRAIT_IDS.length })
          : t("subtitleAnon")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {TESTS.map((x) => {
          const done = doneSlugs.has(x.slug);
          return (
            <div
              key={x.slug}
              className="flex flex-col rounded-xl border border-line bg-card p-6 transition hover:border-accent/60"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl">{x.emoji}</span>
                {done && (
                  <span className="rounded-full border border-good/40 bg-good/10 px-2.5 py-0.5 text-xs text-good">
                    {t("completed")}
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl">{tt(`${x.slug}.title`)}</h2>
              <p className="mt-1 text-sm text-accent">{tt(`${x.slug}.tagline`)}</p>
              <p className="mt-3 flex-1 text-sm text-muted">{tt(`${x.slug}.description`)}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {t("meta", { items: x.items.length, minutes: x.minutes })}
                </span>
                <Link
                  href={`/tests/${x.slug}`}
                  className={
                    done
                      ? "rounded-lg border border-line px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-fg"
                      : "rounded-lg bg-accent-strong px-4 py-2 text-sm font-medium text-white transition hover:bg-accent"
                  }
                >
                  {done ? t("repeat") : t("start")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
