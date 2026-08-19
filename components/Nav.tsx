import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { BRAND_WORDMARK, MARK } from "@/lib/brand";

export async function Nav() {
  const session = await auth();
  const t = await getTranslations("nav");

  return (
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox={MARK.viewBox} className="h-6 w-6 fill-accent" aria-hidden>
            {MARK.wings.map((d) => (
              <path key={d} d={d} />
            ))}
            <ellipse cx={MARK.body.cx} cy={MARK.body.cy} rx={MARK.body.rx} ry={MARK.body.ry} />
          </svg>
          <span className="font-display text-xl italic tracking-tight">{BRAND_WORDMARK}</span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-muted">
          <Link href="/tests" className="transition hover:text-fg">
            {t("tests")}
          </Link>
          <Link href="/perfil" className="transition hover:text-fg">
            {t("profile")}
          </Link>
          <Link href="/insights" className="transition hover:text-fg">
            {t("insights")}
          </Link>
          <Link href="/estudios" className="hidden transition hover:text-fg sm:inline">
            {t("studies")}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <LocaleSwitcher />
          {session?.user ? (
            <>
              <span className="hidden text-muted sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-md border border-line px-3 py-1.5 text-muted transition hover:border-accent hover:text-fg">
                  {t("logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted transition hover:text-fg">
                {t("login")}
              </Link>
              <Link
                href="/registro"
                className="rounded-md bg-accent-strong px-3 py-1.5 font-medium text-white transition hover:bg-accent"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
