"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button className="chip" onClick={toggleLocale} type="button">
      {locale === "zh" ? "EN" : "中文"}
    </button>
  );
}
