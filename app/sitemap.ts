import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { TESTS } from "@/lib/tests";
import { SITE_URL } from "@/lib/seo";

// Every indexable route, in every locale, with hreflang alternates so Google
// links the language variants together.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/tests", "/estudios", ...TESTS.map((t) => `/tests/${t.slug}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path.startsWith("/tests/") ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
          ["x-default", `${SITE_URL}/${routing.defaultLocale}${path}`],
        ]),
      },
    })),
  );
}
