import { cookies } from 'next/headers';

/** HttpOnly cookie that carries the Parse session token set by /api/auth/login. */
export const SESSION_COOKIE = 'bifti_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  objectId: string;
  username: string;
  email: string;
  displayName?: string;
  portalRole?: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  department?: string;
};

const STAFF_ROLES = ['admin', 'teacher', 'examiner'];
const cache = new Map<string, { user: SessionUser | null; expires: number }>();

export function isStaffRole(role?: string) {
  return Boolean(role && STAFF_ROLES.includes(role));
}

/** Confirms a session token with Parse. Results are cached briefly to keep page loads fast. */
export async function validateSessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token || token.length > 256) return null;

  const hit = cache.get(token);
  if (hit && hit.expires > Date.now()) return hit.user;

  const serverUrl = (process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '').replace(/\/$/, '');
  const appId = process.env.PARSE_APPLICATION_ID || process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || '';
  const restKey = process.env.PARSE_REST_KEY || process.env.NEXT_PUBLIC_PARSE_REST_KEY;
  const masterKey = process.env.PARSE_MASTER_KEY;
  if (!serverUrl || !appId) return null;

  const headers: Record<string, string> = { 'X-Parse-Application-Id': appId, 'X-Parse-Session-Token': token };
  if (restKey) headers['X-Parse-REST-API-Key'] = restKey;
  else if (masterKey) headers['X-Parse-Master-Key'] = masterKey;

  let user: SessionUser | null = null;
  try {
    const response = await fetch(`${serverUrl}/users/me`, { headers, cache: 'no-store' });
    if (response.ok) {
      const data = await response.json() as Record<string, string | undefined>;
      if (data.objectId) {
        user = {
          objectId: data.objectId,
          username: data.username || '',
          email: (data.email || data.username || '').toLowerCase(),
          displayName: data.displayName,
          portalRole: data.portalRole,
          avatarUrl: data.avatarUrl,
          phone: data.phone,
          bio: data.bio,
          department: data.department,
        };
      }
    } else if (response.status >= 500) {
      return null; // do not cache transient upstream failures
    }
  } catch {
    return null;
  }

  if (cache.size > 500) cache.clear();
  cache.set(token, { user, expires: Date.now() + (user ? 60_000 : 10_000) });
  return user;
}

/** Session for a Server Component / layout (reads the cookie from the incoming request). */
export async function getServerSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return validateSessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Session for a Route Handler. */
export async function getRequestSession(request: { cookies: { get(name: string): { value: string } | undefined } }) {
  return validateSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function forgetSessionToken(token: string | undefined) {
  if (token) cache.delete(token);
}
