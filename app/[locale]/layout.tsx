import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: "%s · Espejo" },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "meta" });

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-hero">
        <NextIntlClientProvider>
          <SessionProvider>
            <Nav />
            <main className="mx-auto w-full max-w-5xl px-4 pb-24">{children}</main>
            <footer className="border-t border-line py-8 text-center text-xs text-muted">
              <p className="mx-auto max-w-2xl px-4">{t("disclaimer")}</p>
            </footer>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
