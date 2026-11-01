import { NextRequest, NextResponse } from 'next/server';
import { isParseConfigured, parseUpdate } from '../../../lib/parse-server';
import { demoProfile, resolveProfile, staffProfiles } from '../../../lib/profile-resolver';

export async function GET(request: NextRequest) {
  try {
    const role = (request.nextUrl.searchParams.get('role') || '').toLowerCase();
    const key = request.nextUrl.searchParams.get('email')
      || request.nextUrl.searchParams.get('studentId')
      || request.nextUrl.searchParams.get('id')
      || '';
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

    const key = body.email || body.studentId || '';
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
