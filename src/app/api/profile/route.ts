import { NextRequest, NextResponse } from 'next/server';
import { forgetSessionToken, type SessionUser } from '../../../lib/auth-server';
import { isResponse, requireUser, roleOf, tokenFrom } from '../../../lib/authz';
import { isParseConfigured, parseUpdate } from '../../../lib/parse-server';
import { demoProfile, resolveProfile, staffProfiles, type PortalProfile } from '../../../lib/profile-resolver';

const STAFF_ROLES = ['teacher', 'examiner', 'admin'];

/** A teacher, examiner or admin profile is built from their own account (stored on the Parse user). */
function staffSelf(session: SessionUser): { profile: PortalProfile; extra: { bio: string; department: string; role: string } } {
  const base = staffProfiles[session.email] || { ...demoProfile, id: `staff-${session.objectId}`, studentId: '', backupSerial: '', barcodeValue: '', classGroup: '', gradeLevel: 'Staff', programme: '', guardian: '', guardianEmail: '', attendance: '—', address: '', country: '' };
  return {
    profile: {
      ...base,
      id: session.objectId,
      email: session.email,
      fullName: session.displayName || base.fullName || session.email.split('@')[0],
      avatarUrl: session.avatarUrl || (staffProfiles[session.email]?.avatarUrl ?? '/brand/icon-512.png'),
      phone: session.phone || base.phone || '',
      programme: session.department || base.programme || '',
      status: 'active',
    },
    extra: { bio: session.bio || '', department: session.department || '', role: session.portalRole || '' },
  };
}

/** Learners read only their own profile; staff may look up a learner by email / student id. */
export async function GET(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  try {
    const staff = STAFF_ROLES.includes(roleOf(session) || '');
    const asked = request.nextUrl.searchParams.get('email') || request.nextUrl.searchParams.get('studentId') || request.nextUrl.searchParams.get('id');
    if (staff && (!asked || asked.toLowerCase() === session.email)) {
      const own = staffSelf(session);
      return NextResponse.json({ profile: own.profile, extra: own.extra, source: 'staff' });
    }
    const role = (staff ? request.nextUrl.searchParams.get('role') || roleOf(session) : roleOf(session) || 'student') || '';
    const requested = request.nextUrl.searchParams.get('email')
      || request.nextUrl.searchParams.get('studentId')
      || request.nextUrl.searchParams.get('id')
      || '';
    const key = staff && requested ? requested : session.email;
    const { profile, source } = await resolveProfile(key, role);
    return NextResponse.json({ profile, source });
  } catch (error) {
    return NextResponse.json({
      profile: demoProfile,
      source: 'demo',
      error: error instanceof Error ? error.message : 'fallback',
    });
  }
}

/** Persist avatar (and light profile fields) so headers stay in sync after upload. */
export async function PATCH(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  try {
    const body = await request.json() as {
      email?: string;
      studentId?: string;
      avatarUrl?: string;
      avatarPublicId?: string;
      status?: string;
      phone?: string;
      address?: string;
      country?: string;
    };

    // Staff edit their own account here: name, phone, department, bio and photo are stored on their user.
    const staffBody = body as typeof body & { displayName?: string; bio?: string; department?: string };
    const editingOther = (body.email && body.email.toLowerCase() !== session.email) || (body.studentId && roleOf(session) !== 'admin');
    if (STAFF_ROLES.includes(roleOf(session) || '') && !editingOther) {
      const patch: Record<string, unknown> = {};
      const clip = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
      if (staffBody.displayName !== undefined) {
        const name = clip(staffBody.displayName, 80);
        if (name.length < 2) return NextResponse.json({ error: 'Enter your name (at least 2 characters).' }, { status: 400 });
        patch.displayName = name;
      }
      if (staffBody.phone !== undefined) patch.phone = clip(staffBody.phone, 40);
      if (staffBody.bio !== undefined) patch.bio = clip(staffBody.bio, 500);
      if (staffBody.department !== undefined) patch.department = clip(staffBody.department, 80);
      if (body.avatarUrl !== undefined) {
        const url = clip(body.avatarUrl, 600);
        if (url && !/^https:\/\/res\.cloudinary\.com\//.test(url)) return NextResponse.json({ error: 'The photo link is not valid.' }, { status: 400 });
        patch.avatarUrl = url;
        if (body.avatarPublicId) patch.avatarPublicId = clip(body.avatarPublicId, 300);
      }
      if (Object.keys(patch).length && isParseConfigured()) await parseUpdate('_User', session.objectId, patch);
      forgetSessionToken(tokenFrom(request));
      const own = staffSelf({ ...session, ...(patch as Partial<SessionUser>) });
      return NextResponse.json({ profile: own.profile, extra: own.extra, source: 'staff' });
    }

    // Only administrators may edit someone else's profile; everyone else edits their own.
    const key = roleOf(session) === 'admin' && (body.email || body.studentId) ? (body.email || body.studentId || '') : session.email;
    if (!key) {
      return NextResponse.json({ error: 'email or studentId required' }, { status: 400 });
    }

    if (staffProfiles[key]) {
      if (body.avatarUrl) staffProfiles[key].avatarUrl = body.avatarUrl;
      if (body.status) staffProfiles[key].status = body.status;
      return NextResponse.json({ profile: staffProfiles[key], source: 'staff' });
    }

    const existing = await resolveProfile(key, 'student');
    if (existing.source !== 'parse' || !existing.profile.id || existing.profile.id === 'demo') {
      return NextResponse.json({
        profile: {
          ...existing.profile,
          ...(body.avatarUrl ? { avatarUrl: body.avatarUrl } : {}),
          ...(body.status ? { status: body.status } : {}),
        },
        source: existing.source,
      });
    }

    const patch: Record<string, unknown> = {};
    if (body.avatarUrl) patch.avatarUrl = body.avatarUrl;
    if (body.avatarPublicId) patch.avatarPublicId = body.avatarPublicId;
    if (body.status) patch.status = body.status;
    if (body.phone) patch.phone = body.phone;
    if (body.address) patch.address = body.address;
    if (body.country) patch.country = body.country;

    if (Object.keys(patch).length && isParseConfigured()) {
      await parseUpdate('StudentProfile', existing.profile.id, patch);
    }

    const refreshed = await resolveProfile(key, 'student');
    return NextResponse.json({
      profile: {
        ...refreshed.profile,
        ...(body.avatarUrl ? { avatarUrl: body.avatarUrl } : {}),
      },
      source: refreshed.source,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to update profile',
    }, { status: 500 });
  }
}
