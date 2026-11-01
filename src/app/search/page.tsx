'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SiteHeader from '../../components/site-header';
import { useI18n } from '../../components/language-provider';

type Entry = { id: string; title: string; subtitle: string; href: string; kind: string };

const groups: { kind: string; key: string }[] = [
  { kind: 'course', key: 'Courses' },
  { kind: 'person', key: 'People' },
  { kind: 'page', key: 'Pages' },
];

/** Full results for the header search. Reads ?q= from the URL. */
export default function SearchPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const value = (new URLSearchParams(window.location.search).get('q') || '').slice(0, 120);
    setQuery(value);
    setDraft(value);
    if (!value.trim()) {
      setDone(true);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(value)}&limit=40`)
      .then(response => (response.ok ? response.json() : null))
      .then((data: { results?: Entry[] } | null) => {
        if (active) setResults(data?.results || []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
          setDone(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-semibold text-[#1738a8] hover:underline">{t('Home')}</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>{t('Search')}</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">{t('Search Daily Essential School')}</p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900 sm:px-5 sm:py-5 sm:text-3xl">
          {query ? `${t('Results for')} “${query}”` : t('Search')}
        </h1>

        <form
          action="/search"
          method="get"
          onSubmit={() => undefined}
          className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="search-page-input" className="sr-only">{t('Search courses, teachers and pages')}</label>
          <input
            id="search-page-input"
            name="q"
            type="search"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder={t('Search courses, teachers and pages')}
            className="h-11 min-w-0 flex-1 border border-slate-300 px-3 text-sm outline-none focus:border-[#1738a8] focus:ring-2 focus:ring-[#1738a8]/20"
          />
          <button type="submit" className="h-11 bg-[#1738a8] px-5 text-sm font-bold text-white hover:bg-[#102d88]">{t('Search')}</button>
        </form>

        {loading && <p className="mt-6 text-sm text-slate-500">{t('Searching')}…</p>}

        {!loading && done && !query.trim() && (
          <div className="mt-6 border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{t('Type a course, a person or a page name to begin')}.</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold text-[#1738a8]">
              {[['Courses', '/courses'], ['Pricing', '/pricing'], ['Admissions', '/admissions'], ['PDF library', '/library'], ['Assignments', '/student/assignments'], ['Student ID & recovery key', '/student/id']].map(([label, href]) => (
                <li key={href}><Link href={href} className="border border-slate-200 px-2.5 py-1.5 hover:border-[#1738a8]">{t(label)}</Link></li>
              ))}
            </ul>
          </div>
        )}

        {!loading && done && query.trim() && results.length === 0 && (
          <div className="mt-6 border border-dashed border-slate-300 bg-white p-8">
            <p className="text-sm font-semibold text-slate-800">{t('No matches')} “{query}”.</p>
            <p className="mt-1 text-sm text-slate-600">{t('Try a course name, a person or a portal page')}.</p>
          </div>
        )}

        {groups.map(group => {
          const entries = results.filter(entry => entry.kind === group.kind);
          if (!entries.length) return null;
          return (
            <section key={group.kind} className="mt-8">
              <h2 className="border-b border-slate-300 pb-2 text-[13px] font-bold uppercase tracking-[.14em] text-slate-500">
                {t(group.key)} <span className="text-slate-400">({entries.length})</span>
              </h2>
              <ul className="divide-y divide-slate-100">
                {entries.map(entry => (
                  <li key={entry.id}>
                    <Link href={entry.href} className="group flex flex-col gap-1 px-1 py-3 hover:bg-slate-50 sm:flex-row sm:items-baseline sm:gap-4">
                      <span className="text-[14px] font-semibold text-[#1738a8] group-hover:underline">{entry.title}</span>
                      <span className="text-[12px] leading-5 text-slate-600">{entry.subtitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </section>

      <footer className="mt-8 border-t border-slate-200 bg-[#f7f8fc]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© 2026 Daily Essential School</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/courses" className="hover:text-[#1738a8]">{t('Courses')}</Link>
            <Link href="/pricing" className="hover:text-[#1738a8]">{t('Pricing')}</Link>
            <Link href="/policies" className="hover:text-[#1738a8]">{t('Policies')}</Link>
            <Link href="/privacy" className="hover:text-[#1738a8]">{t('Privacy policy')}</Link>
            <Link href="/terms" className="hover:text-[#1738a8]">{t('Terms of service')}</Link>
            <Link href="/contact" className="hover:text-[#1738a8]">{t('Contact us')}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
