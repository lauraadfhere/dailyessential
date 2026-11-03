import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireRole } from '../../../../lib/authz';
import { createUploadSignature, isCloudinaryConfigured } from '../../../../lib/cloudinary';

export const runtime = 'nodejs';

const FOLDERS = ['courses', 'docs', 'uploads'];

/** Browser-direct upload signatures are issued to staff only, for staff folders. */
export async function GET(request: NextRequest) {
  const session = await requireRole(request, ['teacher', 'examiner', 'admin']);
  if (isResponse(session)) return session;
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 503 });
    }
    const folder = request.nextUrl.searchParams.get('folder') || 'uploads';
    if (!FOLDERS.includes(folder)) return NextResponse.json({ error: 'Unknown upload folder.' }, { status: 400 });
    const signed = createUploadSignature({ folder });
    return NextResponse.json({ ok: true, ...signed });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sign failed' }, { status: 500 });
  }
}
