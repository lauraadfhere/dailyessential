import { NextRequest } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

/** Renders a scannable QR code as SVG. Used by the student ID card. */
export async function GET(request: NextRequest) {
  const data = (request.nextUrl.searchParams.get('data') || '').slice(0, 600);
  const size = Math.min(Math.max(Number(request.nextUrl.searchParams.get('size') || 220), 80), 640);

  if (!data) {
    return new Response('Missing data parameter', { status: 400 });
  }

  try {
    const svg = await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size,
      color: { dark: '#0f1f4b', light: '#ffffff' },
    });
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return new Response('Could not render QR code', { status: 500 });
  }
}
