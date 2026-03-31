"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Locale = "zh" | "en";

const LanguageContext = createContext<{ locale: Locale; toggleLocale: () => void } | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    const stored = window.localStorage.getItem("atlas-locale");
    if (stored === "zh" || stored === "en") {
      setLocale(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      toggleLocale: () => {
        setLocale((current) => {
          const next = current === "zh" ? "en" : "zh";
          window.localStorage.setItem("atlas-locale", next);
          return next;
        });
      }
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
