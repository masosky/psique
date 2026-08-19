"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/perfil";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t("badCredentials"));
      return;
    }
    router.push(next as "/perfil");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="font-display mb-2 text-3xl">{t("loginTitle")}</h1>
      <p className="mb-8 text-sm text-muted">{t("loginSubtitle")}</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <input
          type="password"
          required
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        {error && <p className="text-sm text-bad">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-accent-strong py-3 font-medium text-white transition hover:bg-accent disabled:opacity-50"
        >
          {loading ? t("loginLoading") : t("loginButton")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/registro" className="text-accent hover:underline">
          {t("noAccountLink")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
