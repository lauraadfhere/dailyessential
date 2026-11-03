import { NextRequest, NextResponse } from 'next/server';
import { clientKey, getSession, isResponse, isStaff, rateLimit, requireUser } from '../../../lib/authz';
import { fetchTickets } from '../../../lib/platform-data';
import { getOrganizationPointer, isParseConfigured, parseCreate } from '../../../lib/parse-server';

/** Staff see every ticket; everyone else sees only the tickets they opened. */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { tickets: [] });
  if (isResponse(session)) return session;
  try {
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') || 50) || 50, 1), 100);
    const all = await fetchTickets(isStaff(session) ? limit : 100);
    const tickets = isStaff(session)
      ? all
      : all.filter(ticket => ticket.requesterEmail.toLowerCase() === session.email).slice(0, limit);
    return NextResponse.json({ count: tickets.length, tickets, source: tickets.length ? 'parse' : 'empty' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load tickets', tickets: [] },
      { status: 500 },
    );
  }
}

const cut = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

/** The contact form is public, so it is rate limited and every field is length-capped. */
export async function POST(request: NextRequest) {
  if (!rateLimit(`ticket:${clientKey(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes and try again.' }, { status: 429 });
  }
  try {
    if (!isParseConfigured()) return NextResponse.json({ error: 'The support desk is not available right now.' }, { status: 503 });
    const body = await request.json();
    const session = await getSession(request);

    const requesterName = cut(body.requesterName, 120);
    const requesterEmail = (session?.email || cut(body.requesterEmail, 160)).toLowerCase();
    const subject = cut(body.subject, 160);
    const category = cut(body.category, 40);
    const message = cut(body.message, 4000);
    if (!requesterName || !subject || !category || !message) {
      return NextResponse.json({ error: 'Name, subject, category and message are required.' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(requesterEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    const attachmentUrl = cut(body.attachmentUrl, 600);
    if (attachmentUrl && !/^https:\/\//.test(attachmentUrl)) {
      return NextResponse.json({ error: 'The attachment link is not valid.' }, { status: 400 });
    }

    const organization = await getOrganizationPointer();
    const created = await parseCreate('SupportTicket', {
      organization,
      requesterName,
      requesterEmail,
      subject,
      category,
      priority: ['low', 'normal', 'high'].includes(cut(body.priority, 10)) ? cut(body.priority, 10) : 'normal',
      status: 'open',
      message,
      assignedRole: 'admin',
      attachmentUrl: attachmentUrl || undefined,
    });

    return NextResponse.json({ ok: true, id: created.objectId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ticket create failed' }, { status: 500 });
  }
}
