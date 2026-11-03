import { NextRequest, NextResponse } from 'next/server';
import { clientKey, isResponse, rateLimit, requireUser } from '../../../lib/authz';
import { resolveProfile } from '../../../lib/profile-resolver';
import {
  buildRecoveryKey,
  normaliseRecoveryKey,
  recoveryFileContents,
  usesDedicatedRecoverySecret,
  verifyRecoveryKey,
} from '../../../lib/recovery';

export const runtime = 'nodejs';

/** Issue (or re-derive) the learner's recovery key and the downloadable recovery file. */
export async function GET(request: NextRequest) {
  // A recovery key restores account access, so it is only ever issued to its owner.
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  const key = session.email;
  const role = (session.portalRole || 'student').toLowerCase();

  try {
    const { profile, source } = await resolveProfile(key, role);
    if (!profile.studentId || !profile.email) {
      return NextResponse.json({ error: 'A student ID and email are required to issue a recovery key.' }, { status: 400 });
    }

    const recoveryKey = buildRecoveryKey(profile.studentId, profile.email);
    const file = recoveryFileContents({
      fullName: profile.fullName,
      email: profile.email,
      studentId: profile.studentId,
      gradeLevel: profile.gradeLevel,
      programme: profile.programme,
      classGroup: profile.classGroup,
      recoveryKey,
    });

    return NextResponse.json({
      recoveryKey,
      studentId: profile.studentId,
      email: profile.email,
      fullName: profile.fullName,
      gradeLevel: profile.gradeLevel,
      programme: profile.programme,
      classGroup: profile.classGroup,
      campus: profile.campus,
      fileName: `daily-essential-recovery-${profile.studentId}.txt`,
      file,
      source,
      secretSource: usesDedicatedRecoverySecret() ? 'dedicated' : 'derived',
      note: 'Keep this key private. The school office can verify it to restore portal access.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not issue a recovery key.' },
      { status: 500 },
    );
  }
}

/** Verify a recovery key so a learner can regain access without their password. */
export async function POST(request: NextRequest) {
  // Keys are guessable by brute force without a limit.
  if (!rateLimit(`recovery:${clientKey(request)}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ verified: false, error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }
  try {
    const body = await request.json() as { studentId?: string; email?: string; key?: string };
    const studentId = (body.studentId || '').trim();
    const candidate = normaliseRecoveryKey(body.key || '');

    if (!studentId || !candidate) {
      return NextResponse.json({ verified: false, error: 'Enter your student ID and recovery key.' }, { status: 400 });
    }

    const lookup = body.email?.trim() || studentId;
    const { profile } = await resolveProfile(lookup, 'student');

    if (!profile.studentId || !profile.email) {
      return NextResponse.json({ verified: false, error: 'We could not find that student record.' }, { status: 404 });
    }

    const matches = verifyRecoveryKey(profile.studentId, profile.email, candidate)
      || (studentId !== profile.studentId && verifyRecoveryKey(studentId, profile.email, candidate));

    if (!matches) {
      return NextResponse.json({ verified: false, error: 'That recovery key does not match this student ID.' }, { status: 401 });
    }

    return NextResponse.json({
      verified: true,
      profile: {
        email: profile.email,
        fullName: profile.fullName,
        studentId: profile.studentId,
        gradeLevel: profile.gradeLevel,
        programme: profile.programme,
        classGroup: profile.classGroup,
        campus: profile.campus,
        status: profile.status,
        avatarUrl: profile.avatarUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { verified: false, error: error instanceof Error ? error.message : 'Verification failed.' },
      { status: 500 },
    );
  }
}
