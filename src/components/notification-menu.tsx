'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { demoNotifications, unreadCount, type Notification } from '../lib/notifications';
import { useI18n } from './language-provider';

const iconFor = (type: Notification['type']) => {
  switch (type) {
    case 'assessment': return '📝';
    case 'course': return '📚';
    case 'schedule': return '🗓️';
    case 'identity': return '🪪';
    case 'announcement': return '📣';
    default: return '🔔';
  }
};

function relativeTime(iso: string, locale: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = then - Date.now();
  const minutes = Math.round(diff / 60000);
  const formatter = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en', { numeric: 'auto' });
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
  return formatter.format(Math.round(hours / 24), 'day');
}

type Props = {
  role: 'student' | 'teacher' | 'examiner' | 'parent';
};

/** Bell with a triangle-anchored dropdown listing the latest notifications. */
export default function NotificationMenu({ role }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const allHref = role === 'parent' ? '/parent' : role === 'teacher' ? '/teacher' : role === 'examiner' ? '/examiner' : '/student/notifications';

  useEffect(() => {
    let active = true;
    fetch('/api/notifications')
      .then(response => response.json())
      .then(data => {
        if (!active) return;
        const rows: Notification[] = data.notifications?.length ? data.notifications : demoNotifications;
        setItems(rows);
      })
      .catch(() => setItems(demoNotifications))
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = useMemo(() => unreadCount(items), [items]);
  const preview = items.slice(0, 6);

  const markAllRead = async () => {
    const stamp = new Date().toISOString();
    setItems(current => current.map(item => ({ ...item, readAt: item.readAt || stamp })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read-all' }),
      });
    } catch {
      /* optimistic only — the badge still clears for this visit */
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={`${t('Notifications')}${unread ? `, ${unread}` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative grid h-9 w-9 place-items-center transition hover:bg-white/15 ${open ? 'bg-white/15 text-white' : 'text-white/90 hover:text-white'}`}
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#ffbb2c] px-1 text-[9px] font-black text-slate-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[44px] z-50 w-[min(360px,calc(100vw-1.5rem))] border border-slate-200 bg-white text-slate-900 shadow-2xl">
          <span aria-hidden="true" className="absolute -top-2 right-3 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white" />

          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500">
              {t('Notifications')} {unread > 0 && <span className="ml-1 rounded-full bg-[#1738a8] px-1.5 py-0.5 text-[9px] text-white">{unread}</span>}
            </p>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-[11px] font-semibold text-[#1738a8] hover:underline">
                {t('Mark all as read')}
              </button>
            )}
          </div>

          <ul className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto">
            {preview.length === 0 && (
              <li className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">{t('No notifications yet')}</p>
                <p className="mt-1 text-[12px] text-slate-500">{t('You are all caught up.')}</p>
              </li>
            )}
            {preview.map(item => (
              <li key={item.id}>
                <Link
                  href={item.link || allHref}
                  onClick={() => setOpen(false)}
                  className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${item.readAt ? 'opacity-70' : ''}`}
                >
                  <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8eefc] text-sm">
                    {iconFor(item.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-800">{item.title}</span>
                      {!item.readAt && <span aria-label="unread" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffbb2c]" />}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-[12px] leading-5 text-slate-500">{item.message}</span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {relativeTime(item.createdAt, locale)}
                      {item.priority === 'high' || item.priority === 'urgent' ? ' · ⚑' : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={allHref}
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-[12px] font-bold text-[#1738a8] hover:bg-slate-50"
          >
            {t('View all notifications')} →
          </Link>

          {loaded && items.length > 0 && unread === 0 && (
            <p className="border-t border-slate-100 px-4 py-2 text-center text-[11px] text-slate-400">{t('You are all caught up.')}</p>
          )}
        </div>
      )}
    </div>
  );
}
