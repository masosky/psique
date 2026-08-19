import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadProfile } from "@/lib/profile";
import { AnalisisClient } from "./AnalisisClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: "Análisis con IA - Psique", robots: { index: false, follow: false } };
}

export default async function AnalisisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect({ href: "/login?next=%2Fanalisis", locale });
    return null;
  }

  const [profile, reports] = await Promise.all([
    loadProfile(session.user.id),
    prisma.aiReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const measuredCount = Object.keys(profile).length;

  return (
    <div className="py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl flex items-center gap-3">
          <span className="text-accent">✨</span> Análisis & Psicólogo IA
        </h1>
        <p className="mt-2 text-sm text-muted">
          Genera diagnósticos temáticos profundos basados en todos los tests de tu perfil o realiza
          consultas psicológicas personalizadas.
        </p>
      </header>

      <AnalisisClient initialReports={reports} hasData={measuredCount > 0} />
    </div>
  );
}
