import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";
import { themeCssVars, THEME } from "@/lib/theme";
import { localeAlternates, OG_LOCALE, SITE_NAME, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: THEME.ink,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s · ${SITE_NAME}` },
    description: t("description"),
    applicationName: SITE_NAME,
    alternates: localeAlternates(locale, ""),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: { index: true, follow: true },
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
    // Inline custom properties override the @theme defaults from globals.css,
    // making lib/theme.ts the single place to change colors.
    <html lang={locale} style={themeCssVars()}>
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
