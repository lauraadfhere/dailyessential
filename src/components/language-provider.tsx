'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dirFor, LOCALE_COOKIE, LOCALE_STORAGE_KEY, normaliseLocale, type Locale } from '../lib/i18n/config';
import { translateFromDictionary } from '../lib/i18n/dictionary';

type LanguageContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  ready: boolean;
  setLocale: (locale: Locale) => void;
  t: (english: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  dir: 'ltr',
  ready: false,
  setLocale: () => undefined,
  t: english => english,
});

function storedLocale(): Locale | null {
  try {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LOCALE_COOKIE}=`))
      ?.split('=')[1];
    return normaliseLocale(cookie) || normaliseLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  // Resolve the language from ?lang=, then the saved choice, then the document.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normaliseLocale(params.get('lang'));
    const next = fromQuery
      || storedLocale()
      || normaliseLocale(document.documentElement.lang)
      || 'en';
    setLocaleState(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dirFor(locale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* storage can be blocked; the UI still switches for this page */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', next);
      window.history.replaceState({}, '', url);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    dir: dirFor(locale),
    ready,
    setLocale,
    t: (english: string, fallback?: string) => {
      const translated = translateFromDictionary(english, locale);
      return translated === english && fallback ? fallback : translated;
    },
  }), [locale, ready, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

/** Inline translatable text: <T k="Courses" /> picks the active language. */
export function T({ k, fallback }: { k: string; fallback?: string }) {
  const { t } = useI18n();
  return <>{t(k, fallback)}</>;
}
