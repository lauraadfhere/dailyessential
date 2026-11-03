import { NextRequest, NextResponse } from 'next/server';
import { HANDIN_CLASS, createHandIn, findAssignments, findHandIns, mapHandIn } from '../../../../lib/assignments';
import { isResponse, isStaff, rateLimit, requireUser } from '../../../../lib/authz';
import { gradeEmail, staffAlertEmail } from '../../../../lib/email/templates';
import { getCourse } from '../../../../lib/courses-data';
import { notifyEmails, notifyStaff } from '../../../../lib/notify';
import { isParseConfigured, parseUpdate } from '../../../../lib/parse-server';

const clip = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

/** Learners: their own hand-ins. Staff: every hand-in, filtered by assignment / status. */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { submissions: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ submissions: [], configured: false });

  const where: Record<string, unknown> = {};
  const assignmentId = clip(request.nextUrl.searchParams.get('assignmentId'), 40);
  if (assignmentId) where.assignmentId = assignmentId;
  if (isStaff(session)) {
    const status = request.nextUrl.searchParams.get('status');
    if (status === 'submitted' || status === 'graded') where.status = status;
    const email = clip(request.nextUrl.searchParams.get('email'), 160).toLowerCase();
    if (email) where.studentEmail = email;
  } else {
    where.studentEmail = session.email;
  }
  const rows = await findHandIns(where, 300);
  return NextResponse.json({ submissions: rows.map(mapHandIn) }, { headers: { 'Cache-Control': 'private, no-store' } });
}

/** A learner hands in a PDF (uploaded through /api/media/upload). Handing in again replaces the file and clears the grade. */
export async function POST(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (isStaff(session)) return NextResponse.json({ error: 'Staff do not hand in assignments.' }, { status: 403 });
  if (!isParseConfigured()) return NextResponse.json({ error: 'Assignments are unavailable until the school database is configured.' }, { status: 503 });
  if (!rateLimit(`handin:${session.objectId}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many hand-ins. Please wait a little.' }, { status: 429 });
  }

  try {
    const body = await request.json() as { assignmentId?: string; fileUrl?: string; fileName?: string; note?: string };
    const assignment = (await findAssignments({ objectId: clip(body.assignmentId, 40) }, 1))[0];
    if (!assignment) return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    if ((assignment.status || 'published') !== 'published') return NextResponse.json({ error: 'This assignment is closed.' }, { status: 409 });

    // Only files we stored ourselves are accepted, so a learner cannot attach an arbitrary link.
    const fileUrl = clip(body.fileUrl, 600);
    if (!/^https:\/\/res\.cloudinary\.com\//.test(fileUrl)) {
      return NextResponse.json({ error: 'Upload your PDF first, then hand it in.' }, { status: 400 });
    }

    const now = new Date();
    const late = Boolean(assignment.dueAt && now.getTime() > new Date(assignment.dueAt).getTime());
    const payload = {
      assignmentId: assignment.objectId,
      assignmentTitle: assignment.title,
      courseSlug: assignment.courseSlug || '',
      studentEmail: session.email,
      studentName: session.displayName || session.email.split('@')[0],
      fileUrl,
      fileName: clip(body.fileName, 160) || 'assignment.pdf',
      note: clip(body.note, 2000),
      status: 'submitted' as const,
      submittedAt: now.toISOString(),
      late,
    };

    const existing = (await findHandIns({ assignmentId: assignment.objectId, studentEmail: session.email }, 1))[0];
    let id: string;
    if (existing) {
      await parseUpdate(HANDIN_CLASS, existing.objectId, {
        ...payload, feedback: '', gradedBy: '', gradedAt: '', marks: { __op: 'Delete' }, maxMarks: { __op: 'Delete' },
      });
      id = existing.objectId;
    } else {
      id = (await createHandIn(payload)).objectId;
    }

    void notifyStaff({
      type: 'assessment',
      title: `${existing ? 'Re-submitted' : 'New hand-in'}: ${assignment.title}`,
      message: `${payload.studentName}${late ? ' (late)' : ''} handed in ${payload.fileName}.`,
      link: '/teacher/assignments',
      sourceType: HANDIN_CLASS,
      sourceId: id,
      email: ({ name }) => staffAlertEmail({ name, learner: payload.studentName, subject: assignment.title, courseTitle: assignment.courseTitle, excerpt: `${payload.fileName}${late ? ' (late)' : ''}${payload.note ? `\n${payload.note}` : ''}`, kind: 'assignment', link: '/teacher/assignments' }),
    }, ['teacher', 'examiner']);

    return NextResponse.json({ ok: true, id, late, resubmitted: Boolean(existing) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not hand in your assignment.' }, { status: 500 });
  }
}

/** Staff give a mark (out of the assignment's maximum, 20 by default) and written notes. */
export async function PATCH(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isStaff(session)) return NextResponse.json({ error: 'Only teaching staff can grade assignments.' }, { status: 403 });

  try {
    const body = await request.json() as { id?: string; marks?: number; maxMarks?: number; feedback?: string };
    const found = (await findHandIns({ objectId: clip(body.id, 40) }, 1))[0];
    if (!found) return NextResponse.json({ error: 'Hand-in not found.' }, { status: 404 });

    const assignment = (await findAssignments({ objectId: found.assignmentId }, 1))[0];
    const maxMarks = Math.min(100, Math.max(1, Number(body.maxMarks ?? assignment?.maxMarks ?? 20) || 20));
    const marks = Number(body.marks);
    if (!Number.isFinite(marks) || marks < 0 || marks > maxMarks) {
      return NextResponse.json({ error: `Marks must be a number from 0 to ${maxMarks}.` }, { status: 400 });
    }
    const feedback = clip(body.feedback, 3000);
    await parseUpdate(HANDIN_CLASS, found.objectId, {
      marks: Math.round(marks * 100) / 100, maxMarks, feedback, status: 'graded',
      gradedBy: session.displayName || session.email, gradedAt: new Date().toISOString(),
    });

    void notifyEmails([found.studentEmail], {
      type: 'assessment',
      title: `Assignment graded: ${found.assignmentTitle || 'assignment'} (${marks}/${maxMarks})`,
      message: feedback || 'Open Assignments to see your mark and your teacher\'s notes.',
      link: '/student/assignments',
      priority: 'high',
      sourceType: HANDIN_CLASS,
      sourceId: found.objectId,
      email: ({ name }) => gradeEmail({ name, courseTitle: found.courseSlug ? getCourse(found.courseSlug)?.title : assignment?.courseTitle, itemTitle: found.assignmentTitle || 'Assignment', kind: 'assignment', marks, max: maxMarks, feedback, gradedBy: session.displayName || session.email, link: '/student/assignments' }),
    });
    return NextResponse.json({ ok: true, marks, maxMarks });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the grade.' }, { status: 500 });
  }
}
