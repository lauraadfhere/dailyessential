import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryConfigStatus, isCloudinaryConfigured, pdfDeliveryUrl, uploadToCloudinary } from '../../../../lib/cloudinary';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isCloudinaryConfigured(),
    cloudinary: cloudinaryConfigStatus,
    folders: ['bifti/avatars', 'bifti/courses', 'bifti/tickets', 'bifti/docs'],
    endpoints: {
      upload: '/api/media/upload',
      sign: '/api/media/sign',
      documents: '/api/documents',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || 'uploads');
    const resourceType = String(form.get('resourceType') || 'auto') as 'image' | 'raw' | 'auto';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, {
      folder,
      resourceType,
      filename: file.name,
      publicId: form.get('publicId') ? String(form.get('publicId')) : undefined,
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
