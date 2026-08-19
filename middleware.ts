import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Todo menos /api, /_next y ficheros estáticos.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
