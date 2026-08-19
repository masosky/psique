import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

// Public origin of the deployed site. Metadata (canonical, OG, sitemap) is
// built against it; the localhost fallback keeps dev working without config.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "Psique";

export const OG_LOCALE: Record<string, string> = { es: "es_ES", en: "en_US" };

/**
 * Canonical + hreflang alternates for a page.
 * `path` is the route WITHOUT locale prefix ("/tests/big-five", "" for home).
 * Every locale variant lists every other as an alternate, plus x-default
 * pointing at the default locale — exactly what Google asks for.
 */
export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`]));
  return {
    canonical: `/${locale}${path}`,
    languages: { ...languages, "x-default": `/${routing.defaultLocale}${path}` },
  };
}

/** Serialize a schema.org object for a <script type="application/ld+json">. */
export function jsonLd(data: object): string {
  return JSON.stringify({ "@context": "https://schema.org", ...data });
}
