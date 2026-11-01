'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { modules, roleCatalog } from '../lib/school-model';
import UserAvatar from './user-avatar';
import { usePortalIdentity } from '../hooks/use-portal-identity';

export default function WorkspaceShell({ role, active, children }: { role: string; active: string; children: ReactNode }) {
  const current = roleCatalog.find(([slug]) => slug === role) ?? roleCatalog[0];
  const portalRole = role === 'teacher' || role === 'examiner' || role === 'admin' ? role : 'student';
  const { identity, avatarUrl } = usePortalIdentity(portalRole);
  const homeHref = role === 'student' ? '/student/dashboard' : role === 'admin' ? '/admin' : `/${role}`;
  const accountHref = role === 'student' ? '/student/profile' : homeHref;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-[#102c84] bg-[#1738a8] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <Link href={homeHref} className="flex items-center gap-2" aria-label="Daily Essential School home">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={120} height={48} priority className="h-8 w-auto object-contain sm:h-10" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{identity.displayName || current[1]}</p>
              <p className="text-xs text-white/70">
                {current[2]} workspace
                {identity.status ? ` · ${identity.status}` : ''}
              </p>
            </div>
            <Link href={accountHref} aria-label="Account profile">
              <UserAvatar
                src={avatarUrl}
                name={identity.displayName || String(current[1])}
                status={identity.status || 'active'}
                size="md"
              />
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-5 lg:grid-cols-[244px_1fr]">
        <aside className="h-fit rounded-lg bg-[#1738a8] p-2 text-white shadow-sm">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/60">Workspace</p>
          {modules.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/workspace/${role}/${slug}`}
              className={`block rounded px-3 py-2 text-sm transition ${active === slug ? 'bg-white font-semibold text-[#1738a8]' : 'hover:bg-white/10'}`}
            >
              {label}
            </Link>
          ))}
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
