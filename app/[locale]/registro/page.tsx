"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";

function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/tests";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      // La API devuelve códigos de error; se traducen aquí.
      const byCode: Record<string, string> = {
        invalid_email: t("errInvalidEmail"),
        weak_password: t("errWeakPassword"),
        email_taken: t("errEmailTaken"),
      };
      setError(byCode[data.error as string] ?? t("signupFailed"));
      setLoading(false);
      return;
    }

    // Autologin tras el registro
    const login = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push(next as "/tests");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="font-display mb-2 text-3xl">{t("signupTitle")}</h1>
      <p className="mb-8 text-sm text-muted">{t("signupSubtitle")}</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
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
          minLength={8}
          placeholder={t("passwordHint")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        {error && <p className="text-sm text-bad">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-accent-strong py-3 font-medium text-white transition hover:bg-accent disabled:opacity-50"
        >
          {loading ? t("signupLoading") : t("signupButton")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-accent hover:underline">
          {t("hasAccountLink")}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
