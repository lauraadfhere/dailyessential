import { NextRequest, NextResponse } from 'next/server';
import { hasParseMasterKey, isParseConfigured } from '../../../../lib/parse-server';
import { clientKey, rateLimit } from '../../../../lib/authz';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '../../../../lib/auth-server';

/**
 * Server-side Parse login.
 *
 * The browser used to call Parse directly with NEXT_PUBLIC_PARSE_REST_KEY. That value is
 * inlined at build time, so a Cloudflare build without it sends no REST key and Parse
 * answers 403 {"error":"unauthorized"}. Doing the login here uses the Worker secrets
 * (PARSE_REST_KEY / PARSE_MASTER_KEY), which are available at request time.
 */
export async function POST(request: NextRequest) {
  // Slow down password guessing: 10 attempts per address per minute.
  if (!rateLimit(`login:${clientKey(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many sign-in attempts. Wait a minute and try again.' }, { status: 429 });
  }
  let username = '';
  let password = '';
  try {
    const body = await request.json() as { username?: string; email?: string; password?: string };
    username = String(body.username || body.email || '').trim();
    password = String(body.password || '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!username || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (!isParseConfigured()) {
    return NextResponse.json({ error: 'Login is not configured on the server (Parse URL / application id missing).' }, { status: 503 });
  }

  const serverUrl = (process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '').replace(/\/$/, '');
  const appId = process.env.PARSE_APPLICATION_ID || process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || '';
  const restKey = process.env.PARSE_REST_KEY || process.env.NEXT_PUBLIC_PARSE_REST_KEY;

  const headers: Record<string, string> = {
    'X-Parse-Application-Id': appId,
    'Content-Type': 'application/json',
  };
  if (restKey) headers['X-Parse-REST-API-Key'] = restKey;
  else if (hasParseMasterKey()) headers['X-Parse-Master-Key'] = process.env.PARSE_MASTER_KEY as string;
  else {
    return NextResponse.json({ error: 'Login is not configured on the server (PARSE_REST_KEY missing).' }, { status: 503 });
  }

  let response: Response;
  try {
    response = await fetch(`${serverUrl}/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach the school database.' }, { status: 502 });
  }

  const text = await response.text();
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(text) as Record<string, unknown>; } catch { /* non-JSON error body */ }

  if (!response.ok) {
    // Parse code 101 = invalid username/password. Anything else is a server credential problem.
    if (data.code === 101 || response.status === 404) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.error(`Parse login failed (${response.status}): ${text}`);
    return NextResponse.json({
      error: 'The server could not authenticate with the school database. Check the Parse secrets on the Worker.',
      parseStatus: response.status,
    }, { status: 502 });
  }

  // Never forward anything beyond what the client needs.
  const result = NextResponse.json({
    sessionToken: data.sessionToken,
    objectId: data.objectId,
    username: data.username,
    email: data.email || data.username,
    displayName: data.displayName,
    portalRole: data.portalRole,
  });
  // The server-readable session is what protects /courses; sessionStorage is only a UI hint.
  result.cookies.set(SESSION_COOKIE, String(data.sessionToken), {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return result;
}
