import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Only the API is blocked here. Private pages (profile, insights, auth forms)
// use a robots noindex meta tag instead: blocking them in robots.txt would
// keep Google from ever seeing that noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
