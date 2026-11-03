import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, forgetSessionToken } from '../../../../lib/auth-server';

export async function POST(request: NextRequest) {
  forgetSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
