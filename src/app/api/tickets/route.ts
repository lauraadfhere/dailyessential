import { NextRequest, NextResponse } from 'next/server';
import { fetchTickets } from '../../../lib/platform-data';
import { getOrganizationPointer, isParseConfigured, parseCreate } from '../../../lib/parse-server';

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || 50), 100);
    const tickets = await fetchTickets(limit);
    return NextResponse.json({ count: tickets.length, tickets, source: tickets.length ? 'parse' : 'empty' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load tickets', tickets: [] },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isParseConfigured()) return NextResponse.json({ error: 'Parse not configured' }, { status: 503 });
    const body = await request.json();
    const required = ['requesterName', 'requesterEmail', 'subject', 'category', 'message'] as const;
    for (const key of required) {
      if (!body[key]) return NextResponse.json({ error: `${key} is required` }, { status: 400 });
    }

    const organization = await getOrganizationPointer();
    const created = await parseCreate('SupportTicket', {
      organization,
      requesterName: String(body.requesterName),
      requesterEmail: String(body.requesterEmail),
      subject: String(body.subject),
      category: String(body.category),
      priority: String(body.priority || 'normal'),
      status: 'open',
      message: String(body.message),
      assignedRole: String(body.assignedRole || 'admin'),
      attachmentUrl: body.attachmentUrl ? String(body.attachmentUrl) : undefined,
    });

    return NextResponse.json({ ok: true, id: created.objectId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ticket create failed' }, { status: 500 });
  }
}
