// The supported locales, with no framework imports, so tests and scripts can
// read them without pulling in next-intl's navigation (which needs the Next
// runtime). i18n/routing.ts builds the actual routing on top of this.
//
// Order here is the order shown in the language dropdown.
export const LOCALES = ["en", "es", "ca", "pt", "fr", "it", "de", "ru"] as const;

// English is the default: it is what an unprefixed URL resolves to, what
// hreflang x-default points at, and the reference the other locales are
// checked against in lib/i18n.test.ts.
export const DEFAULT_LOCALE = "en";

export type Locale = (typeof LOCALES)[number];
