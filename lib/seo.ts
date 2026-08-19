import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Public origin of the deployed site. Canonical URLs, Open Graph tags and the
 * sitemap are all built against it.
 *
 * Getting this wrong is silent and expensive — link previews break and search
 * engines see a canonical pointing at localhost — so there is a fallback to
 * the platform's own domain before giving up and assuming local development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  // Railway injects this for every service; a slightly wrong real domain
  // still beats localhost, which cannot work for anyone outside this machine.
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return `https://${railway}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Psique";

// Open Graph wants POSIX-style locales, not the bare codes used in URLs.
export const OG_LOCALE: Record<string, string> = {
  es: "es_ES",
  en: "en_US",
  ca: "ca_ES",
  pt: "pt_PT",
  fr: "fr_FR",
  it: "it_IT",
  de: "de_DE",
  ru: "ru_RU",
};

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
