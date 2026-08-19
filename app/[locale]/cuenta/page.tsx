import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShareSettings } from "@/components/account/ShareSettings";
import { DangerZone } from "@/components/account/DangerZone";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  // Personal, session-bound page: keep it out of search indexes.
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function CuentaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  // next-intl's `redirect` isn't typed as `never`; explicit guard.
  if (!session?.user?.id) {
    redirect({ href: "/login?next=%2Fcuenta", locale });
    return null;
  }

  const [t, user, politicalTraits] = await Promise.all([
    getTranslations("account"),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { shareId: true, sharePolitics: true, email: true, name: true },
    }),
    // The politics tick is pointless until the political test has been taken.
    prisma.traitScore.count({
      where: { userId: session.user.id, trait: { in: ["econ", "auth"] } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl py-14">
      <header className="mb-10">
        <h1 className="font-display text-4xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted">
          {user?.name ? `${user.name} · ${user.email}` : user?.email}
        </p>
      </header>

      <div className="space-y-6">
        <ShareSettings
          initialShareId={user?.shareId ?? null}
          initialPolitics={user?.sharePolitics ?? false}
          hasPolitics={politicalTraits >= 2}
        />
        <DangerZone />
      </div>
    </div>
  );
}
