import { NextResponse } from 'next/server';

/** Sanitized Parse connectivity check: reports which values are present, never the values. */
export async function GET() {
  const serverUrl = (process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '').replace(/\/$/, '');
  const appId = process.env.PARSE_APPLICATION_ID || process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || '';
  const restKey = process.env.PARSE_REST_KEY || process.env.NEXT_PUBLIC_PARSE_REST_KEY || '';
  const masterKey = process.env.PARSE_MASTER_KEY || '';

  const config = {
    PARSE_SERVER_URL: Boolean(serverUrl),
    PARSE_APPLICATION_ID: Boolean(appId),
    PARSE_REST_KEY: Boolean(restKey),
    PARSE_MASTER_KEY: Boolean(masterKey),
  };

  const checks: Record<string, number | string> = {};
  if (serverUrl && appId) {
    for (const [name, header, value] of [
      ['restKey', 'X-Parse-REST-API-Key', restKey],
      ['masterKey', 'X-Parse-Master-Key', masterKey],
    ] as const) {
      if (!value) { checks[name] = 'not set'; continue; }
      try {
        const res = await fetch(`${serverUrl}/serverInfo`, {
          headers: { 'X-Parse-Application-Id': appId, [header]: value },
          cache: 'no-store',
        });
        checks[name] = res.status;
      } catch {
        checks[name] = 'unreachable';
      }
    }
  }

  const ok = checks.restKey === 200 || checks.masterKey === 200;
  return NextResponse.json({ ok, config, checks }, { status: ok ? 200 : 503 });
}
