'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import UserAvatar from '../../../components/user-avatar';
import { usePortalIdentity } from '../../../hooks/use-portal-identity';
import { type Notification } from '../../../lib/notifications';

function iconFor(type: Notification['type']) {
  return type === 'assessment' ? '✓' : type === 'schedule' ? '◷' : type === 'identity' ? '◌' : 'i';
}

export default function StudentNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const { identity, avatarUrl } = usePortalIdentity('student');
  const unread = useMemo(() => items.filter(item => !item.readAt).length, [items]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('Unable to load notifications'))))
      .then(data => setItems(Array.isArray(data.notifications) ? data.notifications : []))
      .catch(() => {
        setItems([]);
        setError('Your notifications could not be loaded. Sign in again or try later.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    setItems(current => current.map(item => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'read' }),
    }).catch(() => undefined);
  }

  async function markAllRead() {
    const now = new Date().toISOString();
    setItems(current => current.map(item => ({ ...item, readAt: item.readAt || now })));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    }).catch(() => undefined);
  }

  const navLinks = [
    ['Dashboard', '/student/dashboard'],
    ['Courses', '/courses'],
    ['DAMMI AI', '/dummi-ai'],
    ['Assessments', '/workspace/student/assessments'],
    ['Calendar', '/workspace/student/calendar'],
    ['Profile', '/student/profile'],
  ] as const;

  return (
    <main className="min-h-screen bg-[#f4f5fa] text-slate-900">
      <header className="bg-[#1738a8] text-white shadow-sm">
        <div className="mx-auto flex h-[58px] max-w-[1180px] items-center gap-2 px-3 sm:h-[62px] sm:gap-3 sm:px-6">
          <Link href="/student/dashboard" aria-label="Daily Essential School home" className="flex h-full w-[96px] shrink-0 items-center sm:w-[120px]">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={120} height={48} priority className="h-auto w-full object-contain" />
          </Link>

          <nav aria-label="Student portal" className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[13px] font-semibold lg:flex">
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded px-3 py-2 text-white/85 transition hover:bg-white/15 hover:text-white">
                {label}
              </Link>
            ))}
            <span className="whitespace-nowrap rounded bg-white/20 px-3 py-2 text-white">
              Notifications{unread ? ` (${unread})` : ''}
            </span>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(value => !value)}
              className="grid h-9 w-9 place-items-center rounded text-white/90 transition hover:bg-white/15 lg:hidden"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link href="/student/notifications" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded bg-white/15 text-white">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
              {unread > 0 && (
                <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[9px] font-black text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Link href="/workspace/student/settings" aria-label="Settings" className="hidden h-9 w-9 place-items-center rounded text-white/90 transition hover:bg-white/15 sm:grid">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.9 9.9 5.8a1 1 0 0 1-.8.7l-1.9.3-.9 1.6 1.3 1.4a1 1 0 0 1 .2 1l-.6 1.8 1.1 1.4 1.8-.6a1 1 0 0 1 1 .2l1.4 1.3 1.6-.9.3-1.9a1 1 0 0 1 .7-.8l1.9-.4.5-1.7-1.3-1.4a1 1 0 0 1-.2-1l.6-1.8-1.1-1.4-1.8.6a1 1 0 0 1-1-.2L12 2.5z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </Link>
            <Link href="/contact" aria-label="Help" className="hidden h-9 w-9 place-items-center rounded text-white/90 transition hover:bg-white/15 sm:grid">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M9.7 9a2.4 2.4 0 1 1 3.8 1.9c-1.2.8-1.5 1.3-1.5 2.5M12 17h.01" />
              </svg>
            </Link>
            <Link href="/student/profile" aria-label={`Account${identity.status ? `, ${identity.status}` : ''}`} className="ml-1">
              <UserAvatar src={avatarUrl} name={identity.displayName || 'Student'} status={identity.status || 'active'} size="sm" />
            </Link>
          </div>
        </div>

        {navOpen && (
          <nav aria-label="Mobile student portal" className="border-t border-white/15 px-3 py-3 lg:hidden">
            <div className="grid gap-1">
              {navLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setNavOpen(false)}
                  className="rounded px-3 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                >
                  {label}
                </Link>
              ))}
              <span className="rounded bg-white/20 px-3 py-3 text-sm font-semibold text-white">
                Notifications{unread ? ` (${unread})` : ''}
              </span>
            </div>
          </nav>
        )}

        <div className="border-t border-white/15">
          <div className="mx-auto flex min-h-10 max-w-[1180px] flex-col gap-2 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
            <p className="truncate text-white/75">Student portal · Alerts, deadlines and identity updates</p>
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
              <button
                type="button"
                disabled={!unread}
                onClick={markAllRead}
                className="text-white/90 hover:text-white disabled:cursor-not-allowed disabled:text-white/40"
              >
                Mark all read
              </button>
              <Link href="/student/dashboard" className="text-white hover:underline">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[900px] px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Student portal</p>
            <h1 className="mt-2 text-2xl font-bold text-[#15133d] sm:text-3xl">Notifications</h1>
            <p className="mt-2 text-sm text-slate-500">
              {unread ? `${unread} unread notification${unread === 1 ? '' : 's'}` : 'You are all caught up.'}
            </p>
          </div>
          <button
            type="button"
            disabled={!unread}
            onClick={markAllRead}
            className="self-start text-sm font-bold text-[#1738a8] disabled:cursor-not-allowed disabled:text-slate-400 sm:self-auto"
          >
            Mark all as read
          </button>
        </div>

        {error && <p className="mt-5 border-l-4 border-black bg-slate-100 px-4 py-3 text-sm text-slate-700">{error}</p>}

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-sm text-slate-500 sm:p-8">Loading notifications…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 sm:p-8">No notifications yet.</p>
          ) : (
            items.map(item => (
              <article
                key={item.id}
                className={`flex gap-3 border-b border-slate-100 p-4 last:border-0 sm:gap-4 sm:p-5 ${item.readAt ? '' : 'bg-[#f7f9ff]'}`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    item.readAt ? 'bg-slate-100 text-slate-500' : 'bg-[#e8eefc] text-[#1738a8]'
                  }`}
                >
                  {iconFor(item.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-3">
                    <h2 className={`text-[15px] font-bold sm:text-base ${item.readAt ? 'text-slate-700' : 'text-slate-900'}`}>
                      {item.title}
                    </h2>
                    <time className="shrink-0 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</time>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold">
                    {item.link && (
                      <Link href={item.link} onClick={() => markRead(item.id)} className="text-[#1738a8] hover:underline">
                        Open
                      </Link>
                    )}
                    {!item.readAt && (
                      <button type="button" onClick={() => markRead(item.id)} className="text-slate-500 hover:text-slate-900">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
