import { NextRequest, NextResponse } from 'next/server';
import { clientKey, getSession, isStaff, rateLimit } from '../../../../lib/authz';
import { isCloudinaryConfigured, pdfDeliveryUrl, uploadToCloudinary } from '../../../../lib/cloudinary';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Folders anyone can upload to because the page that uses them is public (admission forms, contact desk). */
const PUBLIC_FOLDERS = ['admissions', 'tickets'];
/** Folders any signed-in user may write to. */
const MEMBER_FOLDERS = ['avatars', 'assignments'];
/** Folders reserved for staff. */
const STAFF_FOLDERS = ['courses', 'docs', 'uploads'];

export async function GET() {
  return NextResponse.json({ ok: true, configured: isCloudinaryConfigured() });
}

export async function POST(request: NextRequest) {
  try {
    const folder = String((await request.clone().formData()).get('folder') || 'uploads');
    const session = await getSession(request);

    const allowed = PUBLIC_FOLDERS.includes(folder)
      || (Boolean(session) && MEMBER_FOLDERS.includes(folder))
      || (isStaff(session) && STAFF_FOLDERS.includes(folder));
    if (!allowed) {
      return NextResponse.json(
        { error: session ? 'You cannot upload to this location.' : 'Sign in to upload files.' },
        { status: session ? 403 : 401 },
      );
    }
    if (!rateLimit(`upload:${session?.objectId || clientKey(request)}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many uploads. Please wait a few minutes.' }, { status: 429 });
    }

    const form = await request.formData();
    const file = form.get('file');
    const resourceType = String(form.get('resourceType') || 'auto') as 'image' | 'raw' | 'auto';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Files must be 8 MB or smaller.' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and image files (JPG, PNG, WebP, GIF) are accepted.' }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, {
      folder,
      resourceType,
      filename: file.name,
      // Only staff may choose the stored name; everyone else gets a generated one.
      publicId: isStaff(session) && form.get('publicId') ? String(form.get('publicId')) : undefined,
    });

    const isPdf = (result.format || file.name.split('.').pop() || '').toLowerCase() === 'pdf'
      || file.type === 'application/pdf'
      || result.resource_type === 'raw';

    return NextResponse.json({
      url: isPdf ? pdfDeliveryUrl(result.secure_url) : result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      viewerPath: isPdf ? `/library?q=${encodeURIComponent(file.name)}` : null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}
