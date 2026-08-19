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
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="font-display text-3xl tracking-tight">
          Informes & Diagnóstico Psicométrico
        </h1>
        <p className="mt-1.5 text-xs text-muted">
          Síntesis clínica y narrativa estructurada a partir de todas las dimensiones evaluadas en
          tu perfil.
        </p>
      </header>

      <AnalisisClient initialReports={reports} hasData={measuredCount > 0} />
    </div>
  );
}
