export const locales = ['en', 'fr', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; native: string; dir: 'ltr' | 'rtl'; currency: string }> = {
  en: { label: 'English', native: 'English', dir: 'ltr', currency: 'USD' },
  fr: { label: 'French', native: 'Français', dir: 'ltr', currency: 'USD' },
  ar: { label: 'Arabic', native: 'العربية', dir: 'rtl', currency: 'DZD' },
};

export const LOCALE_COOKIE = 'dailyessential.lang';
export const LOCALE_STORAGE_KEY = 'dailyessential.lang';

export function normaliseLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const clean = value.trim().toLowerCase().slice(0, 2);
  return (locales as readonly string[]).includes(clean) ? (clean as Locale) : null;
}

export function dirFor(locale: Locale) {
  return localeMeta[locale].dir;
}

/** Locale-aware number/currency formatting shared by pricing and dashboards. */
export function formatCurrency(amount: number, currency: 'DZD' | 'USD', locale: Locale) {
  const localeTag = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-DZ' : 'en-US';
  try {
    return new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'DZD' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
