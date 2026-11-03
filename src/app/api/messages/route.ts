import { NextRequest, NextResponse } from 'next/server';
import { isResponse, isStaff, rateLimit, requireUser } from '../../../lib/authz';
import { getCourse } from '../../../lib/courses-data';
import { findSubmissions } from '../../../lib/learning';
import { messageReplyEmail, staffAlertEmail } from '../../../lib/email/templates';
import { notifyEmails, notifyStaff } from '../../../lib/notify';
import { isParseConfigured, parseCreateEnsured, parseQuery, parseUpdate } from '../../../lib/parse-server';

/**
 * Messages between learners and teaching staff, including reports of a mark the learner believes is wrong.
 * One row per conversation; the replies live in `thread`.
 */
const CLASS_NAME = 'StaffMessage';
const FIELDS = {
  studentEmail: { type: 'String' },
  studentName: { type: 'String' },
  kind: { type: 'String' },
  subject: { type: 'String' },
  courseSlug: { type: 'String' },
  courseTitle: { type: 'String' },
  lessonIndex: { type: 'Number' },
  submissionId: { type: 'String' },
  status: { type: 'String' },
  thread: { type: 'String' },
  lastAt: { type: 'String' },
  unreadStaff: { type: 'Boolean' },
  unreadStudent: { type: 'Boolean' },
} as const;

type Entry = { by: string; role: string; text: string; at: string };
type Row = {
  objectId: string;
  studentEmail: string;
  studentName?: string;
  kind: 'question' | 'mark-dispute';
  subject: string;
  courseSlug?: string;
  courseTitle?: string;
  lessonIndex?: number;
  submissionId?: string;
  status: 'open' | 'answered' | 'resolved';
  thread?: string;
  lastAt?: string;
  unreadStaff?: boolean;
  unreadStudent?: boolean;
};

function entries(raw?: string): Entry[] {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function map(row: Row) {
  return {
    id: row.objectId,
    studentEmail: row.studentEmail,
    studentName: row.studentName || row.studentEmail.split('@')[0],
    kind: row.kind,
    subject: row.subject,
    courseSlug: row.courseSlug || '',
    courseTitle: row.courseTitle || '',
    lessonIndex: row.lessonIndex ?? null,
    submissionId: row.submissionId || '',
    status: row.status,
    thread: entries(row.thread),
    lastAt: row.lastAt || '',
    unreadStaff: Boolean(row.unreadStaff),
    unreadStudent: Boolean(row.unreadStudent),
  };
}

const clip = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

async function findOne(id: string) {
  const data = await parseQuery<Row>(CLASS_NAME, { where: JSON.stringify({ objectId: id }), limit: 1 });
  return data.results?.[0] ?? null;
}

/** In-app notification plus e-mail (once SMTP is set up) for the learner. Never throws. */
async function notifyStudent(row: Row, title: string, message: string, from: string) {
  await notifyEmails([row.studentEmail], {
    type: 'announcement',
    title,
    message,
    link: '/student/messages',
    sourceType: CLASS_NAME,
    sourceId: row.objectId,
    email: ({ name }) => messageReplyEmail({ name, from, subject: row.subject, excerpt: message, markReview: row.kind === 'mark-dispute' }),
  });
}

/** Learners see their own conversations; staff see all of them (newest activity first). */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { messages: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ messages: [], configured: false });

  const staff = isStaff(session);
  const where: Record<string, unknown> = {};
  if (!staff) where.studentEmail = session.email;
  const status = request.nextUrl.searchParams.get('status');
  if (status && ['open', 'answered', 'resolved'].includes(status)) where.status = status;

  try {
    const data = await parseQuery<Row>(CLASS_NAME, { where: JSON.stringify(where), limit: 150, order: '-updatedAt' });
    const messages = (data.results || []).map(map);
    return NextResponse.json({
      messages,
      unread: messages.filter(item => (staff ? item.unreadStaff : item.unreadStudent)).length,
      configured: true,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    // The class is created by the first message.
    return NextResponse.json({ messages: [], unread: 0, configured: true });
  }
}

/** A learner opens a conversation, or reports a mark they think is wrong. */
export async function POST(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (isStaff(session)) return NextResponse.json({ error: 'Staff reply to existing conversations.' }, { status: 403 });
  if (!isParseConfigured()) return NextResponse.json({ error: 'Messages are unavailable until the school database is configured.' }, { status: 503 });
  if (!rateLimit(`message:${session.objectId}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'You have sent several messages recently. Please wait before sending another.' }, { status: 429 });
  }

  try {
    const body = await request.json() as { kind?: string; subject?: string; body?: string; courseSlug?: string; lessonIndex?: number; submissionId?: string };
    const kind = body.kind === 'mark-dispute' ? 'mark-dispute' : 'question';
    const text = clip(body.body, 3000);
    let subject = clip(body.subject, 140);
    if (text.length < 10) return NextResponse.json({ error: 'Please write at least a sentence so your teacher can help.' }, { status: 400 });

    let courseSlug = clip(body.courseSlug, 80);
    let lessonIndex = Number.isInteger(Number(body.lessonIndex)) ? Number(body.lessonIndex) : undefined;
    let submissionId = '';

    if (kind === 'mark-dispute') {
      // A dispute must point at the learner's own graded work.
      const submission = (await findSubmissions({ objectId: clip(body.submissionId, 40), studentEmail: session.email }, 1))[0];
      if (!submission || submission.kind !== 'task' || submission.status !== 'graded') {
        return NextResponse.json({ error: 'You can only report a mark on your own graded task.' }, { status: 400 });
      }
      const open = await parseQuery<{ objectId: string }>(CLASS_NAME, {
        where: JSON.stringify({ studentEmail: session.email, submissionId: submission.objectId, status: { $ne: 'resolved' } }),
        limit: 1, keys: 'objectId',
      }).catch(() => ({ results: [] as { objectId: string }[] }));
      if (open.results.length) return NextResponse.json({ error: 'You already have an open report for this mark.' }, { status: 409 });

      courseSlug = submission.courseSlug;
      lessonIndex = submission.lessonIndex;
      submissionId = submission.objectId;
      subject = subject || `Mark review: ${submission.courseTitle || submission.courseSlug}, module ${submission.lessonIndex + 1} (${submission.marks}/${submission.maxMarks})`;
    }

    if (!subject) return NextResponse.json({ error: 'Add a short subject.' }, { status: 400 });
    const course = courseSlug ? getCourse(courseSlug) : undefined;
    const now = new Date().toISOString();
    const name = session.displayName || session.email.split('@')[0];

    const created = await parseCreateEnsured(CLASS_NAME, FIELDS, {
      studentEmail: session.email,
      studentName: name,
      kind,
      subject,
      courseSlug: course?.slug || '',
      courseTitle: course?.title || '',
      lessonIndex: lessonIndex ?? -1,
      submissionId,
      status: 'open',
      thread: JSON.stringify([{ by: name, role: 'student', text, at: now }]),
      lastAt: now,
      unreadStaff: true,
      unreadStudent: false,
    });
    void notifyStaff({
      type: 'announcement',
      priority: kind === 'mark-dispute' ? 'high' : 'normal',
      title: kind === 'mark-dispute' ? `Mark review requested by ${name}` : `New message from ${name}`,
      message: subject,
      link: '/teacher/messages',
      sourceType: CLASS_NAME,
      sourceId: created.objectId,
      email: ({ name: staffName }) => staffAlertEmail({ name: staffName, learner: name, subject, courseTitle: course?.title, excerpt: text.slice(0, 500), kind, link: '/teacher/messages' }),
    }, ['teacher', 'examiner']);
    return NextResponse.json({ ok: true, id: created.objectId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not send your message.' }, { status: 500 });
  }
}

/** Reply to a conversation, mark it read, resolve it, or reopen it. */
export async function PATCH(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  const staff = isStaff(session);

  try {
    const body = await request.json() as { id?: string; text?: string; action?: 'reply' | 'resolve' | 'reopen' | 'read' };
    const row = body.id ? await findOne(String(body.id)) : null;
    if (!row) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    if (!staff && row.studentEmail !== session.email) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });

    const action = body.action || 'reply';
    const now = new Date().toISOString();
    const name = session.displayName || session.email.split('@')[0];

    if (action === 'read') {
      await parseUpdate(CLASS_NAME, row.objectId, staff ? { unreadStaff: false } : { unreadStudent: false });
      return NextResponse.json({ ok: true });
    }
    if (action === 'resolve') {
      await parseUpdate(CLASS_NAME, row.objectId, { status: 'resolved', lastAt: now, unreadStaff: false });
      if (staff) await notifyStudent(row, 'Your conversation was marked resolved', `${row.subject} was marked as resolved by ${name}.`, name);
      return NextResponse.json({ ok: true, status: 'resolved' });
    }
    if (action === 'reopen') {
      await parseUpdate(CLASS_NAME, row.objectId, { status: 'open', lastAt: now, unreadStaff: true });
      return NextResponse.json({ ok: true, status: 'open' });
    }

    const text = clip(body.text, 3000);
    if (text.length < 2) return NextResponse.json({ error: 'Write a reply first.' }, { status: 400 });
    if (row.status === 'resolved' && !staff) return NextResponse.json({ error: 'This conversation is resolved. Reopen it to reply.' }, { status: 409 });

    const thread = [...entries(row.thread), { by: name, role: staff ? 'staff' : 'student', text, at: now }].slice(-100);
    if (!staff) {
      await notifyStaff({ type: 'announcement', title: `Reply from ${name}`, message: row.subject, link: '/teacher/messages', sourceType: CLASS_NAME, sourceId: row.objectId, email: ({ name: staffName }) => staffAlertEmail({ name: staffName, learner: name, subject: row.subject, courseTitle: row.courseTitle, excerpt: text.slice(0, 500), kind: row.kind, link: '/teacher/messages' }) }, ['teacher', 'examiner']);
    }
    await parseUpdate(CLASS_NAME, row.objectId, {
      thread: JSON.stringify(thread),
      lastAt: now,
      status: staff ? 'answered' : 'open',
      unreadStaff: !staff,
      unreadStudent: staff,
    });
    if (staff) await notifyStudent(row, `Reply from ${name}`, text, name);
    return NextResponse.json({ ok: true, status: staff ? 'answered' : 'open' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not send your reply.' }, { status: 500 });
  }
}
