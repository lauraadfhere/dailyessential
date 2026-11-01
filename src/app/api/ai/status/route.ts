import { NextResponse } from 'next/server';
import { aiProviderStatus } from '../../../../lib/ai/providers';

export const runtime = 'nodejs';

export async function GET() {
  const status = aiProviderStatus();
  return NextResponse.json({
    ok: status.nvidia || status.cloudflare,
    ...status,
    features: [
      'study-buddy',
      'generate-test',
      'evaluate',
      'feedback',
      'admission-summary',
    ].map(feature => ({ feature, ready: Boolean(status.nvidia || status.cloudflare) })),
  });
}
