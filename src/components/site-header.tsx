'use client';

import Image from 'next/image';
import { useState } from 'react';
import HeaderSearch from './header-search';
import LanguageSwitcher from './language-switcher';
import { useI18n } from './language-provider';

type Props = {
  /** Marks the current section in the main navigation. */
  active?: 'home' | 'courses' | 'admissions' | 'pricing' | 'library' | 'news' | 'contact' | 'access' | 'dummi-ai';
};

const quickLinks = [
  { id: 'portal-courses', title: 'Courses', subtitle: 'Twenty courses in the catalogue', href: '/courses', kind: 'page' },
  { id: 'portal-admissions', title: 'Admissions', subtitle: 'Apply and upload your documents', href: '/admissions', kind: 'page' },
  { id: 'portal-pricing', title: 'Pricing', subtitle: 'Monthly fees in DZD and USD', href: '/pricing', kind: 'page' },
  { id: 'portal-library', title: 'PDF library', subtitle: 'Lesson notes and past papers', href: '/library', kind: 'page' },
  { id: 'portal-id', title: 'Student ID & recovery key', subtitle: 'Digital card and account recovery', href: '/student/id', kind: 'page' },
  { id: 'portal-dammi', title: 'DAMMI AI', subtitle: 'Your study buddy', href: '/dummi-ai', kind: 'page' },
];

/**
 * Public site header shared by the home page and the content pages, so the
 * navigation, language switch and search behave identically everywhere.
 */
export default function SiteHeader({ active }: Props) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { locale, t } = useI18n();

  const current = (key: Props['active']) => (active === key ? 'text-white underline decoration-[#ffbb2c] decoration-2 underline-offset-4' : '');

  const primaryLinks: { key: Props['active']; label: string; href: string }[] = [
    { key: 'access', label: 'Our school', href: `/access?lang=${locale}` },
    { key: 'courses', label: 'Programmes', href: `/courses?lang=${locale}` },
    { key: 'admissions', label: 'Admissions', href: '/admissions' },
    { key: undefined, label: 'School portal', href: `/login?lang=${locale}` },
    { key: 'library', label: 'PDF library', href: '/library' },
    { key: 'news', label: 'News', href: '/news' },
    { key: 'dummi-ai', label: 'DAMMI AI', href: '/dummi-ai' },
    { key: 'pricing', label: 'Pricing', href: `/pricing?lang=${locale}` },
    { key: 'contact', label: 'Support', href: '/contact' },
  ];

  const mobileLinks: [string, string][] = [
    ['Our school', `/access?lang=${locale}`],
    ['Programmes', `/courses?lang=${locale}`],
    ['Admissions', '/admissions'],
    ['School portal', `/login?lang=${locale}`],
    ['PDF library', '/library'],
    ['News', '/news'],
    ['DAMMI AI', '/dummi-ai'],
    ['Pricing', `/pricing?lang=${locale}`],
    ['Support', '/contact'],
    ['Contact us', '/contact'],
  ];

  return (
    <header className="relative z-20 font-sans">
      <div className="h-[62px] bg-[#1738a8] shadow-sm">
        <div className="flex h-full items-center justify-between px-4 sm:px-9">
          <a href={`/?lang=${locale}`} aria-label="Daily Essential School home" className="flex h-full w-[136px] items-center">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={136} height={56} priority className="h-auto w-full object-contain" />
          </a>

          <div className="flex items-center gap-4 sm:gap-8">
            <LanguageSwitcher label={t('Select language')} />
            <div className="flex items-center gap-3 sm:gap-5">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Daily Essential School on LinkedIn" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 text-[11px] font-bold leading-none text-white transition hover:bg-white hover:text-[#1738a8]">
                in
              </a>
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} aria-expanded={isSearchOpen} aria-controls="site-search" aria-label={t('Search')} className="text-white transition hover:text-blue-100">
                <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="10.8" cy="10.8" r="5.6" strokeWidth={3} />
                  <path strokeLinecap="round" strokeWidth={3} d="m15.1 15.1 4.1 4.1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div id="site-search" className="border-t border-white/15 bg-[#102d88] px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-[760px] items-start gap-2">
            <HeaderSearch autoFocus extraItems={quickLinks} onNavigate={() => setIsSearchOpen(false)} className="flex-1" />
            <button type="button" onClick={() => setIsSearchOpen(false)} aria-label={t('Close search')} className="h-11 px-3 text-xl text-white hover:text-blue-100">×</button>
          </div>
        </div>
      )}

      <div className="h-[54px] bg-[#424242] text-white shadow-[0_2px_7px_rgba(0,0,0,0.25)]">
        <div className="flex h-full items-center px-4 sm:px-9">
          <button onClick={() => setIsNavigationOpen(!isNavigationOpen)} aria-expanded={isNavigationOpen} className={`relative mr-auto h-full text-[18px] font-semibold leading-none transition hover:text-white/80 after:absolute after:bottom-0 after:left-0 after:h-1 after:bg-white after:transition-all sm:text-[21px] ${isNavigationOpen ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}>SCHOOL</button>
          <nav aria-label="Primary navigation" className="hidden h-full items-center [&>a]:relative [&>a]:px-[26px] [&>a]:text-[14px] [&>a]:after:absolute [&>a]:after:bottom-0 [&>a]:after:left-[26px] [&>a]:after:h-1 [&>a]:after:w-0 [&>a]:after:bg-white [&>a]:after:transition-all [&>a:hover]:after:w-[calc(100%-52px)] xl:flex">
            {primaryLinks.slice(0, 3).map(link => (
              <a key={link.label} href={link.href} className={`px-[25px] text-[12px] font-semibold whitespace-nowrap hover:text-white/70 ${current(link.key)}`}>{t(link.label)}</a>
            ))}
            {primaryLinks.slice(3, 6).map(link => (
              <a key={link.label} href={link.href} className={`px-[25px] text-[12px] font-semibold whitespace-nowrap hover:text-white/70 ${current(link.key)}`}>{t(link.label)}</a>
            ))}
            {primaryLinks.slice(6).map(link => (
              <a key={link.label} href={link.href} className={`px-[25px] text-[12px] font-semibold whitespace-nowrap hover:text-white/70 ${current(link.key)}`}>{link.label === 'DAMMI AI' ? link.label : t(link.label)}</a>
            ))}
            <span aria-hidden="true" className="mx-3 h-3 border-l border-white" />
            <div className="group relative flex h-full items-center">
              <a href={`/courses?lang=${locale}`} className="relative flex h-full items-center pl-[25px] text-[12px] font-semibold whitespace-nowrap transition hover:text-white/70 after:absolute after:bottom-0 after:left-[25px] after:h-1 after:w-0 after:bg-white after:transition-all group-hover:after:w-[calc(100%-25px)] group-focus-within:after:w-[calc(100%-25px)]">
                {t('Courses & Support')}
              </a>
              <div className="invisible absolute end-0 top-full z-30 w-[min(760px,calc(100vw-2rem))] translate-y-1 border-b-4 border-[#1738a8] bg-white p-6 text-slate-800 opacity-0 shadow-xl transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="flex items-center gap-2 border-b-2 border-[#1738a8] pb-3"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#1738a8] text-[10px] font-bold text-white">›</span><h2 className="text-[17px] font-bold tracking-wide">{t('Courses & Support')}</h2></div>
                <div className="border-b border-slate-200 py-2 text-right"><a href="/admissions" className="inline-flex items-center gap-1.5 text-[11px] italic text-[#1738a8] transition hover:text-[#102d88] hover:underline"><svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5 5 19" /></svg>{t('Request admission')}</a></div>
                <div className="grid gap-x-8 gap-y-5 pt-5 sm:grid-cols-3">
                  <div><h3 className="text-xs font-bold uppercase tracking-wider text-[#1738a8]">{t('Learning')}</h3><div className="mt-3 space-y-2 text-xs"><a href={`/courses?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Explore courses')}</a><a href="/library" className="block hover:text-[#1738a8]">› {t('PDF library')}</a><a href={`/login/student?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Student portal')}</a><a href={`/login/teacher?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Teacher portal')}</a></div></div>
                  <div><h3 className="text-xs font-bold uppercase tracking-wider text-[#1738a8]">{t('Support')}</h3><div className="mt-3 space-y-2 text-xs"><a href="/contact" className="block hover:text-[#1738a8]">› {t('Contact school support')}</a><a href="/policies" className="block hover:text-[#1738a8]">› {t('Policies & forms')}</a><a href="/privacy" className="block hover:text-[#1738a8]">› {t('Privacy & security')}</a></div></div>
                  <div><h3 className="text-xs font-bold uppercase tracking-wider text-[#1738a8]">{t('Quick links')}</h3><div className="mt-3 space-y-2 text-xs"><a href="/dummi-ai" className="block hover:text-[#1738a8]">› DAMMI AI</a><a href={`/access?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Role access & logins')}</a><a href="/admin/login" className="block hover:text-[#1738a8]">› {t('Admin login')}</a><a href="/news" className="block hover:text-[#1738a8]">› {t('Latest news')}</a></div></div>
                </div>
              </div>
            </div>
          </nav>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-expanded={isMobileMenuOpen} aria-label={t('Open navigation')} className="ml-5 inline-flex xl:hidden">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>

      {isNavigationOpen && (
        <div className="absolute left-0 top-full w-full border-b border-slate-300 bg-white text-slate-800 shadow-lg">
          <div className="mx-auto max-w-[1180px] px-7 py-5">
            <div className="border-b-[3px] border-[#1738a8] pb-3">
              <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-wide text-slate-800"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1738a8] text-[11px] text-white">›</span>{t('School information')}</h2>
            </div>
            <div className="grid gap-x-8 gap-y-3 pt-4 text-[12px] sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2"><a href={`/access?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Role access & portals')}</a><a href={`/courses?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Academic programmes')}</a><a href="/library" className="block hover:text-[#1738a8]">› {t('PDF library & resources')}</a><a href="/dummi-ai" className="block hover:text-[#1738a8]">› DAMMI AI</a></div>
              <div className="space-y-2"><a href={`/login/student?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Student login')}</a><a href={`/login/teacher?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Teacher login')}</a><a href={`/login/examiner?lang=${locale}`} className="block hover:text-[#1738a8]">› {t('Examiner login')}</a></div>
              <div className="space-y-2"><a href="/admin/login" className="block hover:text-[#1738a8]">› {t('Admin login')}</a><a href="/contact" className="block hover:text-[#1738a8]">› {t('Contact support')}</a><a href="/policies" className="block hover:text-[#1738a8]">› {t('Policies & forms')}</a></div>
              <div className="space-y-2"><a href="/news" className="block hover:text-[#1738a8]">› {t('Latest news')}</a><a href="/privacy" className="block hover:text-[#1738a8]">› {t('Privacy policy')}</a><a href="/terms" className="block hover:text-[#1738a8]">› {t('Terms of use')}</a></div>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-white/15 bg-[#353535] px-8 py-5 text-white shadow-lg xl:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-1 sm:grid-cols-2">
            {mobileLinks.map(([item, href]) => (
              <a key={item} href={href} onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/10 py-3 text-sm font-semibold transition hover:pl-2 hover:text-blue-200">{t(item)}</a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
