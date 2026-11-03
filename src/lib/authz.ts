import { NextResponse } from 'next/server';
import { SESSION_COOKIE, validateSessionToken, type SessionUser } from './auth-server';

/**
 * Central authorization for route handlers.
 *
 * Identity always comes from a Parse session verified on the server:
 *  - the HttpOnly `bifti_session` cookie set at login, or
 *  - an `x-parse-session-token` / `Authorization: Bearer` header (used by the admin screens).
 * An email or role sent in a request body is never trusted.
 */
export type Role = 'student' | 'teacher' | 'examiner' | 'admin' | 'parent';

export const STAFF: Role[] = ['teacher', 'examiner', 'admin'];

type RequestLike = Request & { cookies?: { get(name: string): { value: string } | undefined } };

export function tokenFrom(request: RequestLike) {
  const cookie = request.cookies?.get(SESSION_COOKIE)?.value;
  if (cookie) return cookie;
  const header = request.headers.get('x-parse-session-token');
  if (header) return header;
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
}

export async function getSession(request: RequestLike): Promise<SessionUser | null> {
  return validateSessionToken(tokenFrom(request));
}

export function roleOf(user: SessionUser | null): Role | undefined {
  const role = user?.portalRole;
  return role === 'student' || role === 'teacher' || role === 'examiner' || role === 'admin' || role === 'parent' ? role : undefined;
}

export function deny(status: 401 | 403, error?: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { error: error || (status === 401 ? 'Sign in to continue.' : 'You do not have access to this.'), ...extra },
    { status },
  );
}

/** Signed-in users only. Returns the session, or a ready-made 401 response. */
export async function requireUser(request: RequestLike, extra: Record<string, unknown> = {}): Promise<SessionUser | NextResponse> {
  const user = await getSession(request);
  return user ?? deny(401, undefined, extra);
}

/** Signed-in users holding one of `roles`. Returns the session, a 401, or a 403. */
export async function requireRole(request: RequestLike, roles: Role[], extra: Record<string, unknown> = {}): Promise<SessionUser | NextResponse> {
  const user = await getSession(request);
  if (!user) return deny(401, undefined, extra);
  const role = roleOf(user);
  if (!role || !roles.includes(role)) return deny(403, undefined, extra);
  return user;
}

export function isResponse(value: SessionUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export function isStaff(user: SessionUser | null) {
  const role = roleOf(user);
  return Boolean(role && STAFF.includes(role));
}

/** Fixed-window limiter for public endpoints, keyed by caller address. In-process (per isolate). */
const windows = new Map<string, { start: number; count: number }>();

export function clientKey(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || now - entry.start > windowMs) {
    if (windows.size > 2000) windows.clear();
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Escape user text before using it inside a Parse `$regex`. */
export function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
