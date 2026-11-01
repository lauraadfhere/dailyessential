'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useI18n } from './language-provider';

export type SearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  kind: string;
};

type Props = {
  variant?: 'site' | 'portal';
  placeholder?: string;
  /** Extra destinations searched locally (portal pages, current role shortcuts). */
  extraItems?: SearchItem[];
  onNavigate?: () => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
};

const KIND_ORDER = ['portal', 'course', 'person', 'page'];

const KIND_LABELS: Record<string, { en: string; fr: string; ar: string }> = {
  portal: { en: 'Portal', fr: 'Portail', ar: 'البوابة' },
  course: { en: 'Courses', fr: 'Cours', ar: 'الدورات' },
  person: { en: 'People', fr: 'Personnes', ar: 'الأشخاص' },
  page: { en: 'Pages', fr: 'Pages', ar: 'الصفحات' },
};

/**
 * Live search used in the public header and in the portal header.
 *
 * Results come from /api/search (courses, people, pages) plus any local
 * destinations passed in `extraItems`, so a student searching from their portal
 * also finds their own pages first.
 */
export default function HeaderSearch({
  variant = 'site',
  placeholder = 'Search courses, teachers and pages',
  extraItems = [],
  onNavigate,
  autoFocus = false,
  className = '',
  inputClassName = '',
}: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = useId();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [active, setActive] = useState(-1);

  const local = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return extraItems.slice(0, 6);
    return extraItems.filter(item =>
      `${item.title} ${item.subtitle || ''}`.toLowerCase().includes(needle),
    );
  }, [extraItems, query]);

  const items = useMemo(() => {
    const seen = new Set<string>();
    return [...local, ...results].filter(item => {
      const key = item.href + item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [local, results]);

  const groups = useMemo(() => {
    const order = KIND_ORDER.filter(kind => items.some(item => item.kind === kind));
    return order.map(kind => ({
      kind,
      label: KIND_LABELS[kind]?.[locale] || KIND_LABELS[kind]?.en || kind,
      entries: items.filter(item => item.kind === kind),
    }));
  }, [items, locale]);

  // Debounced lookup, aborted whenever the query changes so late replies never win.
  useEffect(() => {
    const needle = query.trim();
    if (needle.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(needle)}&limit=18`, { signal: controller.signal })
        .then(response => (response.ok ? response.json() : null))
        .then((data: { results?: SearchItem[] } | null) => {
          setResults(data?.results || []);
          setActive(-1);
        })
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
      setLoading(false);
    };
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    onNavigate?.();
    if (href.startsWith('/')) router.push(href);
    else window.location.assign(href);
    inputRef.current?.blur();
  };

  const seeAll = () => go(`/search?q=${encodeURIComponent(query.trim())}`);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!items.length) return;
      event.preventDefault();
      setOpen(true);
      setActive(current => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        if (next < 0) return items.length - 1;
        if (next >= items.length) return 0;
        return next;
      });
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (active >= 0 && items[active]) go(items[active].href);
      else if (query.trim().length >= 2) seeAll();
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const shell = variant === 'portal'
    ? 'flex h-9 items-center gap-2 border border-white/35 bg-white px-3 text-sm text-slate-700'
    : 'flex h-11 items-center gap-2 border border-white/40 bg-white px-3 text-sm text-slate-900';

  let cursor = -1;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className={`${shell} ${inputClassName}`}>
        <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="10.8" cy="10.8" r="5.6" strokeWidth="2.5" />
          <path strokeLinecap="round" strokeWidth="2.5" d="m15.1 15.1 4.1 4.1" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={event => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={t('Search courses, teachers and pages')}
          placeholder={t(placeholder)}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-500"
        />
        {loading && (
          <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-[#1738a8]" />
        )}
        {!loading && query && (
          <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} className="shrink-0 text-lg leading-none text-slate-400 hover:text-slate-700">×</button>
        )}
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,520px)] min-w-[280px] overflow-y-auto border border-slate-200 bg-white text-left text-slate-800 shadow-2xl"
        >
          {!query.trim() && (
            <div className="px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{t('Suggested')}</p>
              <div className="mt-2 space-y-0.5">
                {local.map(item => (
                  <Link key={item.id} href={item.href} onClick={event => { event.preventDefault(); go(item.href); }} className="block px-2 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1738a8]">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim().length >= 2 && (
            <>
              {groups.map(group => (
                <div key={group.kind}>
                  <p className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">{group.label}</p>
                  {group.entries.map(item => {
                    cursor += 1;
                    const index = cursor;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        role="option"
                        aria-selected={active === index}
                        onMouseEnter={() => setActive(index)}
                        onClick={event => { event.preventDefault(); go(item.href); }}
                        className={`block border-l-2 px-3 py-2 transition ${active === index ? 'border-[#1738a8] bg-blue-50/70' : 'border-transparent hover:bg-slate-50'}`}
                      >
                        <span className="block text-[13px] font-semibold text-slate-800">{item.title}</span>
                        {item.subtitle && <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{item.subtitle}</span>}
                      </Link>
                    );
                  })}
                </div>
              ))}

              {!items.length && !loading && (
                <p className="px-3 py-4 text-[12px] text-slate-500">
                  {t('No matches')} — {t('try a course name, a person or a portal page')}.
                </p>
              )}

              <button
                type="button"
                onClick={seeAll}
                className="flex w-full items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] font-bold text-[#1738a8] hover:bg-slate-100"
              >
                <span>{t('View all results')} “{query.trim()}”</span>
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
