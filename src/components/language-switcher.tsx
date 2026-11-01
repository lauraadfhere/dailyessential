'use client';

import { localeMeta, locales, type Locale } from '../lib/i18n/config';
import { useI18n } from './language-provider';

type Props = {
  variant?: 'onDark' | 'onLight';
  className?: string;
  label?: string;
};

/** Language picker shared by the public site, portal and auth screens. */
export default function LanguageSwitcher({ variant = 'onDark', className = '', label = 'Select language' }: Props) {
  const { locale, setLocale } = useI18n();

  const base = variant === 'onDark'
    ? 'border-white/45 text-white'
    : 'border-slate-300 text-slate-700';

  return (
    <label className={`relative flex h-7 w-[112px] items-center border px-2 text-[11px] font-medium sm:w-[124px] ${base} ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        onChange={event => setLocale(event.target.value as Locale)}
        className="w-full appearance-none bg-transparent pr-4 outline-none"
        aria-label={label}
      >
        {locales.map(code => (
          <option key={code} value={code} className="text-slate-900">
            {localeMeta[code].native}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-2">▾</span>
    </label>
  );
}
