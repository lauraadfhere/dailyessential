'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import UserAvatar from './user-avatar';
import { usePortalIdentity } from '../hooks/use-portal-identity';
import { readPortalIdentity } from '../lib/portal-session';
import { homeForRole } from '../lib/role-routing';
import { activeTopKey, canAccess, consoleConfigs, type ConsoleRole } from '../lib/console-config';

export default function ConsoleShell({
  role,
  children,
  showSidebar = false,
  greeting,
}: {
  role: ConsoleRole;
  children: ReactNode;
  showSidebar?: boolean;
  greeting?: string;
}) {
  const pathname = usePathname();
  const config = consoleConfigs[role];
  const active = activeTopKey(role, pathname);

  // A signed-in account never lands in another role's console (admin is separate).
  useEffect(() => {
    if (role === 'admin') return;
    const stored = readPortalIdentity().role;
    if (!stored || stored === role || stored === 'admin') return;
    const home = homeForRole(stored);
    if (pathname.startsWith(home)) return;
    window.location.replace(home);
  }, [pathname, role]);
  const { identity, avatarUrl } = usePortalIdentity(role === 'admin' ? 'admin' : role);
  const visibleSidebar = config.sidebar
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.permission || canAccess(role, item.permission)),
    }))
    .filter(group => group.items.length > 0);

  return (
    <main className="min-h-screen bg-white font-sans text-[#2f3338]">
      <header className="sticky top-0 z-40 h-[54px] bg-[#2e343b] text-white shadow-sm">
        <div className="mx-auto flex h-full max-w-[1280px] items-center gap-4 px-4 sm:px-6">
          <Link href={config.homeHref} className="flex shrink-0 items-center gap-2" aria-label={`Daily Essential School ${config.label} home`}>
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={108} height={44} priority className="h-8 w-auto object-contain" />
          </Link>

          <button type="button" className="hidden items-center gap-2 rounded border border-white/20 bg-white/5 px-3 py-1.5 text-left text-xs hover:bg-white/10 sm:flex">
            <span>
              <span className="block font-semibold leading-tight">{config.campusLabel}</span>
              <span className="block text-[10px] text-white/65">{config.campusCount} total</span>
            </span>
            <svg aria-hidden="true" className="ml-1 h-3 w-3 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <nav aria-label={`${config.label} primary`} className="ml-1 flex h-full max-w-[48%] items-center gap-1 overflow-x-auto lg:ml-2 lg:max-w-none lg:overflow-visible">
            {config.topNav.map(item => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative flex h-full shrink-0 items-center px-2 text-[12px] font-medium transition sm:px-3 sm:text-[13px] ${isActive ? 'text-white' : 'text-white/75 hover:text-white'}`}
                >
                  {item.label}
                  {isActive && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-[#2e9fff]" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/80 sm:inline">
              {config.label}{identity.status ? ` · ${identity.status}` : ''}
            </span>
            <Link href="/dummi-ai" className="hidden rounded bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-black/55 sm:inline">
              DAMMI AI
            </Link>
            <Link href={config.helpHref} aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded text-white/85 transition hover:bg-white/10 hover:text-white">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
            </Link>
            <Link href={config.accountHref} aria-label={`${config.label} account`} className="inline-flex">
              <UserAvatar src={avatarUrl} name={identity.displayName || config.label} status={identity.status || 'active'} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {greeting && (
        <div className="border-b border-[#e6e9ee] bg-white">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[15px] leading-6 text-[#4a515a]">{greeting}</p>
            <Link href={config.settingsHref} className="shrink-0 text-sm font-medium text-[#2e9fff] hover:underline">Edit Settings</Link>
          </div>
        </div>
      )}

      {showSidebar ? (
        <div className="mx-auto grid max-w-[1280px] lg:grid-cols-[232px_1fr]">
          <aside className="border-b border-[#e6e9ee] bg-[#f5f7f9] px-3 py-3 lg:border-b-0 lg:border-r lg:py-5">
            <div className="flex gap-4 overflow-x-auto lg:block lg:overflow-visible">
              {visibleSidebar.map(group => (
                <div key={group.label} className="mb-0 min-w-[200px] lg:mb-5 lg:min-w-0">
                  <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#9aa3ad]">{group.label}</p>
                  <ul className="flex gap-1 lg:block lg:space-y-1">
                    {group.items.map(item => {
                      const base = item.href.split('#')[0];
                      const selected = pathname === base || pathname.startsWith(`${base}/`);
                      return (
                        <li key={`${group.label}-${item.href}`} className="shrink-0 lg:shrink">
                          <Link
                            href={item.href}
                            className={`flex items-center justify-between rounded-sm border-l-[3px] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:text-[#2e9fff] ${selected ? 'border-[#2e9fff] font-semibold text-[#2e9fff]' : 'border-transparent text-[#3d4450]'}`}
                          >
                            <span className="whitespace-nowrap">{item.label}</span>
                            <span aria-hidden="true" className="hidden text-[#c0c6ce] lg:inline">›</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
          <section className="min-h-[calc(100vh-54px)] min-w-0 bg-white">{children}</section>
        </div>
      ) : (
        <section className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 sm:py-10">{children}</section>
      )}

      <footer className="border-t border-[#e6e9ee] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-6 text-[12px] text-[#8b939c] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {config.footer.map(([label, href]) => (
              <Link key={label} href={href} className="hover:text-[#2e9fff]">{label}</Link>
            ))}
          </nav>
          <p>© 2026 — Daily Essential School · {config.label}</p>
        </div>
      </footer>

      <Link
        href={config.helpHref}
        aria-label={`${config.label} help`}
        className="fixed bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-[#2e9fff] text-white shadow-lg transition hover:bg-[#1f8eef] sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        </svg>
      </Link>
    </main>
  );
}
