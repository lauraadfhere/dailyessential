import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireUser } from '../../../lib/authz';
import { isParseConfigured, parseServerRequest, parseUpdate } from '../../../lib/parse-server';
import type { Notification } from '../../../lib/notifications';

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

const recipientOf = (objectId: string) => ({ __type: 'Pointer', className: '_User', objectId });

/** The signed-in user's own notifications only. */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { notifications: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ notifications: [], source: 'unconfigured' });

  try {
    const where = {
      recipient: recipientOf(session.objectId),
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: { __type: 'Date', iso: new Date().toISOString() } } }],
    };
    const result = await parseServerRequest<{ results: ParseObject[] }>(
      `classes/Notification?where=${encodeURIComponent(JSON.stringify(where))}&order=-createdAt&limit=50`,
    );
    return NextResponse.json({ notifications: result.results.map(normalize), source: 'parse' });
  } catch {
    return NextResponse.json({ notifications: [], source: 'unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ error: 'Notifications are unavailable.' }, { status: 503 });

  const body = await request.json().catch(() => ({})) as { id?: string; action?: 'read' | 'read-all' };
  if (body.action !== 'read' && body.action !== 'read-all') {
    return NextResponse.json({ error: 'Use action read or read-all.' }, { status: 400 });
  }

  try {
    const readAt = { __type: 'Date', iso: new Date().toISOString() };
    // Ownership is part of the query, so a user can never mark someone else's notification.
    const where: Record<string, unknown> = { recipient: recipientOf(session.objectId), readAt: { $exists: false } };
    if (body.action === 'read') {
      if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
      where.objectId = body.id;
    }
    const result = await parseServerRequest<{ results: { objectId: string }[] }>(
      `classes/Notification?where=${encodeURIComponent(JSON.stringify(where))}&keys=objectId&limit=100`,
    );
    await Promise.all(result.results.map(item => parseUpdate('Notification', item.objectId, { readAt })));
    return NextResponse.json({ ok: true, updated: result.results.length });
  } catch {
    return NextResponse.json({ error: 'Unable to update notification state.' }, { status: 503 });
  }
}
