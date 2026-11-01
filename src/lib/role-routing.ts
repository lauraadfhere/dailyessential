export type PortalRoleName = 'student' | 'teacher' | 'examiner' | 'parent' | 'admin';

const portals: Record<PortalRoleName, string> = {
  student: '/student/dashboard',
  teacher: '/teacher',
  examiner: '/examiner',
  parent: '/parent',
  admin: '/admin',
};

export function isPortalRole(value: string | null | undefined): value is PortalRoleName {
  return Boolean(value && value in portals);
}

/** Where a signed-in account belongs after login. */
export function homeForRole(role?: string | null) {
  return isPortalRole(role) ? portals[role] : portals.student;
}

/** Which sign-in screen matches a role. */
export function loginForRole(role?: string | null) {
  if (role === 'admin') return '/admin/login';
  if (role === 'teacher' || role === 'examiner' || role === 'student') return `/login/${role}`;
  return '/login';
}

const knownPrefixes = ['/student', '/teacher', '/examiner', '/parent', '/admin', '/courses', '/pricing', '/library', '/dummi-ai', '/admissions', '/contact', '/news'];

/** Only follow relative in-app paths, never an off-site redirect target. */
export function safeNextPath(next: string | null | undefined, fallback = '/student/dashboard') {
  if (!next) return fallback;
  const value = next.trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

/** Pick a sensible landing page for a role and a requested destination. */
export function landingFor(role: string | null | undefined, requested?: string | null) {
  const home = homeForRole(role);
  const target = safeNextPath(requested, home);
  const allowed = role === 'student'
    ? knownPrefixes
    : role === 'teacher'
      ? ['/teacher', '/courses', '/library', '/pricing', '/dummi-ai', '/contact']
      : role === 'examiner'
        ? ['/examiner', '/workspace/examiner', '/courses', '/library', '/pricing', '/contact']
        : role === 'admin'
          ? ['/admin']
          : ['/parent', '/courses', '/library', '/pricing', '/contact'];

  return allowed.some(prefix => target === prefix || target.startsWith(`${prefix}/`)) ? target : home;
}
