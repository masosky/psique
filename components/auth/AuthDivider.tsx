"use client";

import { useTranslations } from "next-intl";

// "or" separator between the Google button and the email form.
export function AuthDivider() {
  const t = useTranslations("auth");
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs text-muted">{t("or")}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
