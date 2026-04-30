"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSite } from "@/components/westler/site-content-provider";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/locale";
import type { NavKey } from "@/lib/site-types";

type HeaderCopy = {
  brand: string;
  nav: Record<NavKey, string>;
  discuss: string;
  languageAria: string;
  menuOpen: string;
  menuClose: string;
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  header: HeaderCopy;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && isLocale(stored)) {
        setLocaleState(stored);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const site = useSite(locale);

  const header = useMemo<HeaderCopy>(
    () => ({
      brand: site.brand,
      nav: site.header.nav,
      discuss: site.header.discuss,
      languageAria: site.header.languageAria,
      menuOpen: site.header.menuOpen,
      menuClose: site.header.menuClose,
    }),
    [site],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      header,
    }),
    [locale, setLocale, header],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
