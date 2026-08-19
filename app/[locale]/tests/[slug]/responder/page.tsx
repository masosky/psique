import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { getTest } from "@/lib/tests";
import { TestRunner } from "@/components/TestRunner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!getTest(slug)) return {};
  const t = await getTranslations({ locale, namespace: "tests" });
  // The runner is auth-gated; the public, indexable page is the test sheet.
  return { title: t(`${slug}.title`), robots: { index: false, follow: false } };
}

export default async function AnswerTestPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const test = getTest(slug);
  if (!test) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect({
      href: `/login?next=${encodeURIComponent(`/tests/${slug}/responder`)}`,
      locale,
    });
    return null;
  }

  // Los enunciados se resuelven aquí (server) y se pasan ya traducidos al
  // runner, que es un client component.
  const t = await getTranslations({ locale, namespace: "tests" });
  const items = test.items.map((i) => ({ id: i.id, text: t(`${slug}.items.${i.id}`) }));

  return (
    <TestRunner slug={test.slug} emoji={test.emoji} title={t(`${slug}.title`)} items={items} />
  );
}
