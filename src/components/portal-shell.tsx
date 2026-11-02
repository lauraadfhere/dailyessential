'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import HeaderSearch from './header-search';
import LanguageSwitcher from './language-switcher';
import NotificationMenu from './notification-menu';
import UserAvatar from './user-avatar';
import { usePortalIdentity } from '../hooks/use-portal-identity';
import { clearPortalIdentity, readPortalIdentity } from '../lib/portal-session';
import { homeForRole } from '../lib/role-routing';

type Role = 'student' | 'teacher' | 'examiner' | 'parent';

type AccountEntry = {
  org: string;
  email: string;
};

const portalAccounts: Record<Role, { org: string; shortOrg: string; displayName: string; email: string; linked: AccountEntry[] }> = {
  student: {
    org: 'Daily Essential School',
    shortOrg: 'Daily Essential School',
    displayName: 'Amina Ahmed',
    email: 'student@bifti.school',
    linked: [
      { org: 'Daily Essential Main Campus', email: 'amina.ahmed@student.bifti.school' },
      { org: 'Daily Essential Digital Learning Hub', email: 'learner@digital.bifti.school' },
      { org: 'Daily Essential Evening Programme', email: 'evening@student.bifti.school' },
    ],
  },
  teacher: {
    org: 'Daily Essential School',
    shortOrg: 'Daily Essential Staff',
    displayName: 'Mrs. Adebayo',
    email: 'teacher@bifti.school',
    linked: [
      { org: 'Daily Essential Main Campus · Teaching', email: 'adebayo@staff.bifti.school' },
      { org: 'Daily Essential Digital Learning Hub', email: 'mentor@digital.bifti.school' },
    ],
  },
  examiner: {
    org: 'Daily Essential School',
    shortOrg: 'Daily Essential Assessments',
    displayName: 'Mr. Okafor',
    email: 'examiner@bifti.school',
    linked: [
      { org: 'Daily Essential Examination Office', email: 'okafor@exam.bifti.school' },
      { org: 'Daily Essential Quality Control', email: 'quality@exam.bifti.school' },
    ],
  },
  parent: {
    org: 'Daily Essential School',
    shortOrg: 'Daily Essential Families',
    displayName: 'Hassan Ahmed',
    email: 'parent@bifti.school',
    linked: [
      { org: 'Daily Essential Main Campus · Amina Ahmed', email: 'hassan.ahmed@email.com' },
      { org: 'Daily Essential Digital Hub · Emeka Obi', email: 'hassan.ahmed+family@email.com' },
    ],
  },
};

/** Every portal destination, used by the sidebar and by the header search. */
const portalLinks: Record<Role, [string, string][]> = {
  student: [
    ['Dashboard', '/student/dashboard'],
    ['Courses', '/student/courses'],
    ['Assignments', '/student/assignments'],
    ['Grades', '/student/grades'],
    ['Timetable', '/student/timetable'],
    ['Attendance', '/student/attendance'],
    ['Wellbeing', '/student/wellbeing'],
    ['Portfolio', '/student/portfolio'],
    ['Library', '/library'],
    ['My ID', '/student/id'],
    ['Profile', '/student/profile'],
  ],
  teacher: [
    ['Overview', '/teacher'],
    ['My classes', '/teacher/classes'],
    ['Take register', '/teacher/attendance'],
    ['Gradebook', '/teacher/gradebook'],
    ['Lesson planner', '/teacher/planner'],
    ['Search students', '/teacher/search'],
    ['Assign marks', '/teacher/marks'],
    ['Meetings', '/teacher/meetings'],
    ['Messages', '/teacher/messages'],
    ['Appraisal', '/teacher/appraisal'],
  ],
  parent: [
    ['Overview', '/parent'],
    ['Academics', '/parent/academics'],
    ['Fees & payments', '/parent/fees'],
    ['Forms & consent', '/parent/forms'],
    ['Meetings', '/parent/meetings'],
  ],
  examiner: [
    ['Overview', '/examiner'],
    ['Assessments', '/workspace/examiner/assessments'],
    ['Results review', '/workspace/examiner/gradebook'],
    ['Quality control', '/workspace/examiner/audit'],
    ['Reports', '/workspace/examiner/reports'],
  ],
};

function portalSearchItems(role: Role) {
  return portalLinks[role].map(([title, href]) => ({
    id: `portal:${href}`,
    title,
    subtitle: 'Portal page',
    href,
    kind: 'portal',
  }));
}

function ToolbarIcon({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button type="button" aria-label={label} className="grid h-9 w-9 place-items-center text-white/90 transition hover:bg-white/15 hover:text-white">
      {children}
    </button>
  );
}

function ProfileDropdown({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const { identity, avatarUrl } = usePortalIdentity(role);
  const account = portalAccounts[role];
  const email = identity.email || account.email;
  const displayName = identity.displayName || account.displayName;
  const status = identity.status || 'active';
  const profileHref = role === 'student' ? '/student/profile' : role === 'parent' ? '/parent' : `/${role}/dashboard`;
  const switchHref = role === 'student' ? '/workspace/student/settings' : role === 'parent' ? '/parent' : `/workspace/${role}/settings`;
  const loginHref = role === 'parent' ? '/access' : `/login/${role}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative ml-1">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="flex items-center gap-2 rounded px-1 py-1 transition hover:bg-white/15"
      >
        <div className="hidden text-right text-xs leading-tight text-white sm:block">
          <p className="max-w-[190px] truncate font-semibold">{email}</p>
          <p className="max-w-[190px] truncate text-[10px] text-white/75">
            {account.shortOrg}
            {status ? ` · ${status}` : ''}
          </p>
        </div>
        <UserAvatar src={avatarUrl} name={displayName} status={status} size="md" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-1.5rem))] border border-slate-200 bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between gap-3 px-4 py-4 text-sm sm:px-5">
            <p className="min-w-0 truncate font-medium text-slate-700">{account.org}</p>
            <Link href={loginHref} onClick={() => clearPortalIdentity()} className="shrink-0 text-slate-700 hover:underline">Sign out</Link>
          </div>

          <div className="border-t border-slate-100 px-4 py-5 sm:px-5">
            <div className="flex gap-3 sm:gap-4">
              <UserAvatar src={avatarUrl} name={displayName} status={status} size="xl" />
              <div className="min-w-0">
                <h3 className="truncate text-2xl font-semibold leading-none sm:text-3xl">{displayName}</h3>
                <p className="mt-2 truncate text-sm text-slate-600">{email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">Status · {status}</p>
                {identity.programme ? <p className="mt-1 truncate text-xs text-slate-500">{identity.programme}{identity.gradeLevel ? ` · ${identity.gradeLevel}` : ''}{identity.classGroup ? ` · ${identity.classGroup}` : ''}</p> : null}
                <div className="mt-2 space-y-1 text-sm">
                  <Link href={profileHref} onClick={() => setOpen(false)} className="block text-[#0a5cc0] hover:underline">View account</Link>
                  {role === 'student' ? (
                    <Link href="/student/id" onClick={() => setOpen(false)} className="block text-[#0a5cc0] hover:underline">Student ID &amp; recovery key</Link>
                  ) : null}
                  <Link href={switchHref} onClick={() => setOpen(false)} className="block text-[#0a5cc0] hover:underline">Switch campus</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100">
            {account.linked.map(entry => (
              <button key={entry.email} type="button" className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50">
                <UserAvatar src={null} name={entry.email.split('@')[0]} status="active" size="md" showStatus={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-5 text-slate-800">{entry.org}</span>
                  <span className="block truncate text-sm text-slate-600">{entry.email}</span>
                </span>
                <svg aria-hidden="true" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 5h.01M12 12h.01M12 19h.01" />
                </svg>
              </button>
            ))}

            <Link href="/access" onClick={() => setOpen(false)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-[#e8eefc] text-[#1738a8]">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="text-[16px] text-slate-800">Sign in with a different account</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PortalHeader({ title, role }: { title: string; role: Role }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 h-[58px] bg-[#1738a8] font-sans text-white shadow-sm sm:h-[62px]">
      <div className="flex h-full items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <div className="relative">
          <button type="button" aria-label="Open portal tools menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)} className="grid h-9 w-9 place-items-center rounded text-white transition hover:bg-white/15">
            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="5" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="19" cy="5" r="1.5" />
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="19" r="1.5" /><circle cx="12" cy="19" r="1.5" /><circle cx="19" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && <div className="absolute left-0 top-12 z-50 w-[min(14rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-slate-800 shadow-2xl">
            <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">Tools</p>
            {(role === 'teacher'                ? [['Search students', '/teacher/search'], ['Assign marks', '/teacher/marks'], ['Evaluations', '/teacher/evaluations'], ['Courses', '/courses'], ['Pricing', '/pricing']]
              : role === 'examiner'
                ? [['Assessments', '/workspace/examiner/assessments'], ['Results', '/workspace/examiner/gradebook'], ['Reports', '/workspace/examiner/reports'], ['Courses', '/courses'], ['Pricing', '/pricing']]
                : [['DAMMI AI', '/dummi-ai'], ['Courses', '/courses'], ['My ID & recovery key', '/student/id'], ['Assessment', '/workspace/student/assessments'], ['Smart Schedule', '/workspace/student/calendar'], ['Pricing', '/pricing']]
            ).map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 hover:text-[#1738a8]">
              <span className="grid h-7 w-7 place-items-center rounded bg-slate-100 text-xs text-slate-700">◫</span>{label}
            </Link>)}
            {(role === 'teacher' || role === 'examiner') && (
              <Link href="/dummi-ai" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 hover:text-[#1738a8]">
                <span className="grid h-7 w-7 place-items-center rounded bg-black text-[10px] font-black text-white">AI</span>DAMMI AI
              </Link>
            )}
          </div>}
        </div>

        <Link href={role === 'student' ? '/student/dashboard' : `/${role}`} aria-label="Daily Essential School home" className="flex h-full w-[116px] shrink-0 items-center sm:w-[156px]">
          <Image src="/brand/logo-white.png" alt="Daily Essential School" width={1000} height={280} priority className="h-auto w-full object-contain" />
        </Link>

        <span className="hidden whitespace-nowrap border-l border-white/25 pl-4 text-sm font-semibold lg:block">{title}</span>
        <Link href="/dummi-ai" className="hidden whitespace-nowrap rounded bg-black/30 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black/50 md:inline-flex">
          DAMMI AI
        </Link>

        <div className="ml-auto hidden max-w-[440px] flex-1 md:block">
          <HeaderSearch
            variant="portal"
            placeholder="Search your portal, courses and people"
            extraItems={portalSearchItems(role)}
            inputClassName="text-slate-700"
          />
        </div>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 md:ml-3">
          <span className="hidden sm:inline-flex">
            <ToolbarIcon label="Cloud shell">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16v12H4zM8 10l2 2-2 2m4 0h4" />
              </svg>
            </ToolbarIcon>
          </span>
          <span className="hidden sm:inline-flex">
            <LanguageSwitcher variant="onDark" className="border-white/35" />
          </span>
          <NotificationMenu role={role} />
          <span className="hidden sm:inline-flex">
            <ToolbarIcon label="Settings">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.3 3.9 9.9 5.8a1 1 0 0 1-.8.7l-1.9.3-.9 1.6 1.3 1.4a1 1 0 0 1 .2 1l-.6 1.8 1.1 1.4 1.8-.6a1 1 0 0 1 1 .2l1.4 1.3 1.6-.9.3-1.9a1 1 0 0 1 .7-.8l1.9-.4.5-1.7-1.3-1.4a1 1 0 0 1-.2-1l.6-1.8-1.1-1.4-1.8.6a1 1 0 0 1-1-.2L12 2.5z" />
                <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
              </svg>
            </ToolbarIcon>
          </span>
          <span className="hidden sm:inline-flex">
            <ToolbarIcon label="Help">
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                <path strokeLinecap="round" strokeWidth="1.8" d="M9.7 9a2.4 2.4 0 1 1 3.8 1.9c-1.2.8-1.5 1.3-1.5 2.5M12 17h.01" />
              </svg>
            </ToolbarIcon>
          </span>
          <ProfileDropdown role={role} />
        </div>
      </div>
    </header>
  );
}

export default function PortalShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const { identity } = usePortalIdentity(role);

  // A signed-in account never sees another portal's pages: send it home instead.
  useEffect(() => {
    const stored = readPortalIdentity().role;
    if (!stored || stored === role || stored === 'admin') return;
    const home = homeForRole(stored);
    if (pathname.startsWith(home)) return;
    window.location.replace(home);
  }, [pathname, role]);
  const title = role === 'teacher' ? 'Teacher Portal' : role === 'examiner' ? 'Examiner & Controller Portal' : role === 'parent' ? 'Parent Portal' : 'Student Portal';
  const welcomeName = identity.displayName || portalAccounts[role].displayName;
  const standardLinks = portalLinks[role];
  const studentLinks = portalLinks.student;

  return (
    <main className="min-h-screen bg-[#f4f5fa] text-slate-900">
      <PortalHeader title={title} role={role} />
      {role === 'student' ? (
        <div className="min-h-[calc(100vh-58px)] sm:min-h-[calc(100vh-62px)]">
          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-8 sm:py-7">
            <div className="mb-5 flex flex-col justify-between gap-2 border-b border-slate-300 pb-4 sm:mb-7 sm:flex-row sm:items-end sm:gap-4 sm:pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">DAILY ESSENTIAL SCHOOL</p>
                <h1 className="mt-2 text-xl font-bold text-[#15133d] sm:text-3xl">Student Portal</h1>
              </div>
              <div className="text-sm text-slate-500 sm:text-right">
                <p>Welcome back, {welcomeName}</p>
                {(identity.status || identity.programme || identity.gradeLevel) && (
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {identity.gradeLevel ? `Grade · ${identity.gradeLevel}` : identity.status ? `Status · ${identity.status}` : ''}
                    {(identity.gradeLevel || identity.status) && identity.programme ? ' · ' : ''}
                    {identity.programme || ''}
                  </p>
                )}
              </div>
            </div>
            <nav aria-label="Student space" className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200 sm:mb-6">
              {studentLinks.map(([label, href]) => {
                const active = href === '/student/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[12px] font-semibold transition sm:text-[13px] ${active ? 'border-[#1738a8] text-[#1738a8]' : 'border-transparent text-slate-500 hover:text-[#1738a8]'}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            {children}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-8 sm:py-7">
          <div className="mb-5 flex flex-col justify-between gap-2 border-b border-slate-300 pb-4 sm:mb-7 sm:flex-row sm:items-end sm:gap-4 sm:pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">DAILY ESSENTIAL SCHOOL</p>
              <h1 className="mt-2 text-xl font-bold text-[#15133d] sm:text-3xl">{title}</h1>
            </div>
            <div className="text-sm text-slate-500 sm:text-right">
              <p>Welcome back, {welcomeName}</p>
              {identity.status ? <p className="mt-1 text-xs font-semibold text-slate-600">Status · {identity.status}</p> : null}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:gap-6">
            <aside className="h-fit overflow-x-auto bg-[#1738a8] text-white shadow-sm lg:overflow-visible lg:py-2">
              <div className="flex min-w-max lg:block">
                {standardLinks.map(([label, href]) => {
                  const isHome = href === '/teacher' || href === '/examiner' || href === '/parent';
                  const active = isHome ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={label}
                      href={href}
                      className={`block whitespace-nowrap border-b-0 border-r border-white/15 px-4 py-3 text-sm font-semibold transition hover:bg-white hover:text-[#1738a8] lg:border-b lg:border-r-0 lg:px-5 lg:py-4 ${active ? 'bg-white text-[#1738a8]' : ''}`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </aside>
            <section className="min-w-0">{children}</section>
          </div>
        </div>
      )}
    </main>
  );
}
