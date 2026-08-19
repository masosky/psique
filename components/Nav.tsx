import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { auth, signOut } from "@/lib/auth";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { BRAND_WORDMARK, MARK } from "@/lib/brand";

export async function Nav() {
  const session = await auth();
  const t = await getTranslations("nav");

  return (
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur print:hidden">
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
          <Link href="/analisis" className="transition hover:text-fg">
            {t("aiAnalysis")}
          </Link>
          {session?.user && (
            <Link href="/evolucion" className="hidden transition hover:text-fg sm:inline">
              {t("evolution")}
            </Link>
          )}
          <Link href="/estudios" className="hidden transition hover:text-fg sm:inline">
            {t("studies")}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4 text-sm">
          <a
            href="https://github.com/masosky/psique"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition hover:text-fg"
            title="Contribute on GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
          <LocaleSwitcher />
          {session?.user ? (
            <>
              <Link href="/cuenta" className="hidden text-muted transition hover:text-fg sm:inline">
                {session.user.name ?? session.user.email}
              </Link>
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
