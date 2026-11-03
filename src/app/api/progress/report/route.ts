import { NextRequest, NextResponse } from 'next/server';
import { isResponse, isStaff, requireUser } from '../../../../lib/authz';
import { isParseConfigured } from '../../../../lib/parse-server';
import { buildReport } from '../../../../lib/report';

/**
 * Full progress report: per course, what is done, the grade so far, a weekly timeline and exactly what the
 * learner still has to do. Learners get their own; staff may pass ?email= for any learner.
 */
export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ error: 'Reports are unavailable until the school database is configured.' }, { status: 503 });

  const requested = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const email = isStaff(session) && requested ? requested : session.email;
  const name = email === session.email ? session.displayName || email.split('@')[0] : email.split('@')[0];

  try {
    return NextResponse.json(await buildReport(email, name), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not build the report.' }, { status: 500 });
  }
}
