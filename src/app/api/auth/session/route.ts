import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '../../../../lib/auth-server';

/** Who is signed in according to the server (HttpOnly cookie), or 401. */
export async function GET(request: NextRequest) {
  const user = await getRequestSession(request);
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, user });
}
