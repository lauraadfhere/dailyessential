'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { homeForRole } from '../../lib/role-routing';
import { readPortalIdentity } from '../../lib/portal-session';
import { unreadCount, type Notification } from '../../lib/notifications';

/** Every notification for the signed-in account (teachers, examiners, admins and learners). */
export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [home, setHome] = useState('/');

  const load = useCallback(() => {
    fetch('/api/notifications', { cache: 'no-store' })
      .then(async response => {
        if (response.status === 401) throw new Error('Sign in to see your notifications.');
        const data = await response.json().catch(() => ({}));
        setItems(Array.isArray(data.notifications) ? data.notifications : []);
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setHome(homeForRole(readPortalIdentity().role));
    load();
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    const timer = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [load]);

  const unread = useMemo(() => unreadCount(items), [items]);

  const patch = (body: Record<string, string>) =>
    fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => undefined);

  const markRead = (id: string) => {
    setItems(current => current.map(item => (item.id === id && !item.readAt ? { ...item, readAt: new Date().toISOString() } : item)));
    void patch({ id, action: 'read' });
  };
  const markAll = () => {
    const now = new Date().toISOString();
    setItems(current => current.map(item => ({ ...item, readAt: item.readAt || now })));
    void patch({ action: 'read-all' });
  };

  return (
    <main className="min-h-screen bg-[#f4f5fa] text-slate-900">
      <header className="bg-[#1738a8] px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <p className="text-sm font-bold">Notifications{unread > 0 && <span className="ml-2 bg-[#ffbb2c] px-1.5 py-0.5 text-[10px] font-black text-slate-900">{unread} new</span>}</p>
          <Link href={home} className="text-xs font-semibold text-white/85 hover:text-white">← Back to my space</Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#15133d]">All notifications</h1>
          {unread > 0 && <button type="button" onClick={markAll} className="text-xs font-bold text-[#1738a8] hover:underline">Mark all as read</button>}
        </div>

        {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {loading && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
        {!loading && !error && items.length === 0 && <p className="bg-white py-10 text-center text-sm text-slate-500 shadow-sm">No notifications yet. You are all caught up.</p>}

        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id}>
              <Link href={item.link || home} onClick={() => markRead(item.id)} className={`block border bg-white p-4 shadow-sm hover:border-[#1738a8] ${item.readAt ? 'border-slate-200 opacity-75' : 'border-l-4 border-slate-200 border-l-[#ffbb2c]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">{item.message}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
