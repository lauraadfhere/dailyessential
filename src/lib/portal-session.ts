export type PortalIdentity = {
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string;
  status: string;
  studentId: string;
  programme: string;
  classGroup: string;
  gradeLevel: string;
  campus: string;
};

const KEYS = {
  email: 'bifti.userEmail',
  name: 'bifti.displayName',
  role: 'bifti.role',
  avatar: 'bifti.avatarUrl',
  status: 'bifti.status',
  studentId: 'bifti.studentId',
  programme: 'bifti.programme',
  classGroup: 'bifti.classGroup',
  gradeLevel: 'bifti.gradeLevel',
  campus: 'bifti.campus',
} as const;

const emptyIdentity: PortalIdentity = {
  email: '',
  displayName: '',
  role: '',
  avatarUrl: '',
  status: '',
  studentId: '',
  programme: '',
  classGroup: '',
  gradeLevel: '',
  campus: '',
};

export function readPortalIdentity(): PortalIdentity {
  if (typeof window === 'undefined') return { ...emptyIdentity };
  try {
    return {
      email: sessionStorage.getItem(KEYS.email) || '',
      displayName: sessionStorage.getItem(KEYS.name) || '',
      role: sessionStorage.getItem(KEYS.role) || '',
      avatarUrl: sessionStorage.getItem(KEYS.avatar) || '',
      status: sessionStorage.getItem(KEYS.status) || '',
      studentId: sessionStorage.getItem(KEYS.studentId) || '',
      programme: sessionStorage.getItem(KEYS.programme) || '',
      classGroup: sessionStorage.getItem(KEYS.classGroup) || '',
      gradeLevel: sessionStorage.getItem(KEYS.gradeLevel) || '',
      campus: sessionStorage.getItem(KEYS.campus) || '',
    };
  } catch {
    return { ...emptyIdentity };
  }
}

export function writePortalIdentity(partial: Partial<PortalIdentity>) {
  if (typeof window === 'undefined') return;
  try {
    if (partial.email !== undefined) sessionStorage.setItem(KEYS.email, partial.email);
    if (partial.displayName !== undefined) sessionStorage.setItem(KEYS.name, partial.displayName);
    if (partial.role !== undefined) sessionStorage.setItem(KEYS.role, partial.role);
    if (partial.avatarUrl !== undefined) sessionStorage.setItem(KEYS.avatar, partial.avatarUrl);
    if (partial.status !== undefined) sessionStorage.setItem(KEYS.status, partial.status);
    if (partial.studentId !== undefined) sessionStorage.setItem(KEYS.studentId, partial.studentId);
    if (partial.programme !== undefined) sessionStorage.setItem(KEYS.programme, partial.programme);
    if (partial.classGroup !== undefined) sessionStorage.setItem(KEYS.classGroup, partial.classGroup);
    if (partial.gradeLevel !== undefined) sessionStorage.setItem(KEYS.gradeLevel, partial.gradeLevel);
    if (partial.campus !== undefined) sessionStorage.setItem(KEYS.campus, partial.campus);
  } catch {
    /* ignore */
  }
}

/** Sign out: forget the stored identity so the next visit requires signing in again. */
export function clearPortalIdentity() {
  if (typeof window === 'undefined') return;
  try {
    Object.values(KEYS).forEach(key => sessionStorage.removeItem(key));
    sessionStorage.removeItem('bifti.session');
    sessionStorage.removeItem('bifti.userId');
  } catch {
    /* ignore */
  }
  // Also drop the server-side session cookie that guards /courses.
  fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => undefined);
}

/** Default mark shown when a learner has not uploaded a photo yet. */
export const defaultAvatar = '/brand/icon-512.png';

export function avatarFallback(_seed: string) {
  return defaultAvatar;
}

export type ProfileApiPayload = {
  profile?: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    status?: string;
    studentId?: string;
    programme?: string;
    classGroup?: string;
    gradeLevel?: string;
    campus?: string;
  };
};

const PROFILE_CACHE_MS = 45_000;
const PROFILE_CACHE_KEY = 'bifti.profileFetchedAt';

function cacheAge() {
  try {
    return Date.now() - Number(sessionStorage.getItem(PROFILE_CACHE_KEY) || 0);
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function stampCache() {
  try {
    sessionStorage.setItem(PROFILE_CACHE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * Load profile from API and cache identity fields for headers across the app.
 * A short-lived cache keeps navigation snappy; pass { force: true } after a
 * profile edit, sign-in or recovery so the header refreshes immediately.
 */
export async function syncPortalProfile(email?: string, role?: string, options: { force?: boolean } = {}): Promise<PortalIdentity> {
  const current = readPortalIdentity();
  const sameAccount = Boolean(current.email) && (!email || email === current.email) && (!role || !current.role || role === current.role);
  if (!options.force && sameAccount && cacheAge() < PROFILE_CACHE_MS) {
    return current;
  }
  const queryEmail = email || current.email || (role === 'teacher' ? 'teacher@bifti.school' : role === 'examiner' ? 'examiner@bifti.school' : 'student@bifti.school');
  const params = new URLSearchParams({ email: queryEmail });
  if (role) params.set('role', role);

  const response = await fetch(`/api/profile?${params.toString()}`);
  const data = (await response.json()) as ProfileApiPayload;
  const profile = data.profile || {};
  const next: PortalIdentity = {
    email: profile.email || queryEmail,
    displayName: profile.fullName || current.displayName || queryEmail.split('@')[0],
    role: role || current.role || 'student',
    avatarUrl: profile.avatarUrl || current.avatarUrl || avatarFallback(profile.fullName || queryEmail),
    status: profile.status || current.status || 'active',
    studentId: profile.studentId || current.studentId || '',
    programme: profile.programme || current.programme || '',
    classGroup: profile.classGroup || current.classGroup || '',
    gradeLevel: profile.gradeLevel || current.gradeLevel || '',
    campus: profile.campus || current.campus || '',
  };
  writePortalIdentity(next);
  stampCache();
  return next;
}
