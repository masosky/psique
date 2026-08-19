import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except /api, Next internals, static files (anything with a
  // dot), and the extension-less metadata routes (favicon and apple icon) —
  // without that exclusion the i18n middleware would redirect /icon to
  // /es/icon and break the favicon.
  matcher: ["/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
