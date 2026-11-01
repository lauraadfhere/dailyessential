import { NextResponse } from 'next/server';
import { demoNotifications, type Notification } from '../../../lib/notifications';

type ParseObject = {
  objectId: string;
  type: Notification['type'];
  title: string;
  message: string;
  link?: string;
  priority?: Notification['priority'];
  readAt?: { iso: string };
  createdAt: string;
  sourceType?: string;
  sourceId?: string;
};

function parseConfig() {
  return {
    url: (process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL || '').replace(/\/$/, ''),
    appId: process.env.PARSE_APPLICATION_ID || process.env.NEXT_PUBLIC_PARSE_APPLICATION_ID || '',
    masterKey: process.env.PARSE_MASTER_KEY || '',
  };
}

function sessionToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return request.headers.get('x-parse-session-token') || (authorization?.startsWith('Bearer ') ? authorization.slice(7) : '');
}

async function parseFetch<T>(path: string, init: RequestInit = {}, token?: string) {
  const config = parseConfig();
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      'X-Parse-Application-Id': config.appId,
      ...(config.masterKey ? { 'X-Parse-Master-Key': config.masterKey } : {}),
      ...(token ? { 'X-Parse-Session-Token': token } : {}),
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Notification service returned ${response.status}`);
  return response.json() as Promise<T>;
}

function normalize(item: ParseObject): Notification {
  return {
    id: item.objectId,
    type: item.type,
    title: item.title,
    message: item.message,
    link: item.link,
    priority: item.priority || 'normal',
    readAt: item.readAt?.iso,
    createdAt: item.createdAt,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
  };
}

async function getParseUser(token: string) {
  return parseFetch<{ objectId: string }>('/users/me', { headers: { 'X-Parse-Session-Token': token } }, token);
}

export async function GET(request: Request) {
  const token = sessionToken(request);
  const config = parseConfig();
  if (!config.url || !config.appId) {
    return NextResponse.json({ notifications: demoNotifications, source: 'demo' });
  }

  try {
    if (token) {
      const user = await getParseUser(token);
      const where = encodeURIComponent(JSON.stringify({
        recipient: { __type: 'Pointer', className: '_User', objectId: user.objectId },
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: { __type: 'Date', iso: new Date().toISOString() } } }],
      }));
      const result = await parseFetch<{ results: ParseObject[] }>(`/classes/Notification?where=${where}&order=-createdAt&limit=50`, {}, token);
      return NextResponse.json({ notifications: result.results.map(normalize), source: 'parse' });
    }

    // Unauthenticated: still surface recent Parse notifications when master key is available.
    if (config.masterKey) {
      const result = await parseFetch<{ results: ParseObject[] }>('/classes/Notification?order=-createdAt&limit=20');
      if (result.results?.length) {
        return NextResponse.json({ notifications: result.results.map(normalize), source: 'parse' });
      }
    }

    return NextResponse.json({ notifications: demoNotifications, source: 'demo' });
  } catch {
    return NextResponse.json({ notifications: demoNotifications, source: 'demo' });
  }
}

export async function PATCH(request: Request) {
  const token = sessionToken(request);
  const config = parseConfig();
  if (!token || !config.url || !config.appId || !config.masterKey) {
    return NextResponse.json({ notifications: demoNotifications, source: 'demo' });
  }

  const body = await request.json().catch(() => ({})) as { id?: string; action?: 'read' | 'read-all' };
  if (body.action !== 'read' && body.action !== 'read-all') {
    return NextResponse.json({ error: 'Use action read or read-all.' }, { status: 400 });
  }

  try {
    const user = await getParseUser(token);
    const readAt = { __type: 'Date', iso: new Date().toISOString() };
    if (body.action === 'read' && body.id) {
      await parseFetch(`/classes/Notification/${encodeURIComponent(body.id)}`, { method: 'PUT', body: JSON.stringify({ readAt }) }, token);
    } else if (body.action === 'read-all') {
      const where = encodeURIComponent(JSON.stringify({ recipient: { __type: 'Pointer', className: '_User', objectId: user.objectId }, readAt: { $exists: false } }));
      const result = await parseFetch<{ results: ParseObject[] }>(`/classes/Notification?where=${where}&limit=100`, {}, token);
      await Promise.all(result.results.map(item => parseFetch(`/classes/Notification/${item.objectId}`, { method: 'PUT', body: JSON.stringify({ readAt }) }, token)));
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to update notification state.' }, { status: 503 });
  }
}

