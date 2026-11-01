import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryConfigStatus, createUploadSignature, isCloudinaryConfigured } from '../../../../lib/cloudinary';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Cloudinary is not configured', cloudinary: cloudinaryConfigStatus }, { status: 503 });
    }
    const folder = request.nextUrl.searchParams.get('folder') || 'uploads';
    const publicId = request.nextUrl.searchParams.get('publicId') || undefined;
    const signed = createUploadSignature({ folder, publicId });
    return NextResponse.json({ ok: true, ...signed, cloudinary: cloudinaryConfigStatus });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sign failed' }, { status: 500 });
  }
}
