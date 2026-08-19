import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { DEFAULT_LOCALE, LOCALES } from "./locales";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

export type { Locale } from "./locales";

// Wrappers around Next's navigation APIs that respect the active locale.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
