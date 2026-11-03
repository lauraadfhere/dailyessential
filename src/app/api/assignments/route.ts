import { NextRequest, NextResponse } from 'next/server';
import { ASSIGNMENT_CLASS, createAssignment, findAssignments, findHandIns, mapAssignment, mapHandIn } from '../../../lib/assignments';
import { isResponse, isStaff, requireUser } from '../../../lib/authz';
import { getCourse } from '../../../lib/courses-data';
import { assignmentPostedEmail } from '../../../lib/email/templates';
import { notifyCourseStudents } from '../../../lib/notify';
import { isParseConfigured, parseServerRequest, parseUpdate } from '../../../lib/parse-server';

const clip = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

/**
 * Learners: published assignments, each with their own hand-in.
 * Staff: every assignment with how many hand-ins are waiting and how many are graded.
 */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { assignments: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ assignments: [], configured: false });

  const staff = isStaff(session);
  const rows = await findAssignments(staff ? {} : { status: 'published' }, 100);
  const handIns = await findHandIns(staff ? {} : { studentEmail: session.email }, 500);

  const assignments = rows.map(row => {
    const base = mapAssignment(row);
    if (staff) {
      const mine = handIns.filter(item => item.assignmentId === row.objectId);
      return { ...base, counts: { submitted: mine.filter(item => item.status === 'submitted').length, graded: mine.filter(item => item.status === 'graded').length } };
    }
    const own = handIns.find(item => item.assignmentId === row.objectId);
    return { ...base, mine: own ? mapHandIn(own) : null };
  });
  return NextResponse.json({ assignments, configured: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}

/** A teacher, examiner or admin posts an assignment. Learners of the course are notified. */
export async function POST(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isStaff(session)) return NextResponse.json({ error: 'Only teaching staff can create assignments.' }, { status: 403 });
  if (!isParseConfigured()) return NextResponse.json({ error: 'Assignments are unavailable until the school database is configured.' }, { status: 503 });

  try {
    const body = await request.json() as { title?: string; description?: string; courseSlug?: string; dueAt?: string; maxMarks?: number };
    const title = clip(body.title, 160);
    if (title.length < 3) return NextResponse.json({ error: 'Give the assignment a title.' }, { status: 400 });
    const course = body.courseSlug ? getCourse(String(body.courseSlug)) : undefined;
    if (body.courseSlug && !course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 });

    let dueAt = '';
    if (body.dueAt) {
      const date = new Date(body.dueAt);
      if (Number.isNaN(date.getTime())) return NextResponse.json({ error: 'The due date is not valid.' }, { status: 400 });
      dueAt = date.toISOString();
    }
    const maxMarks = Math.min(100, Math.max(1, Number(body.maxMarks ?? 20) || 20));

    const created = await createAssignment({
      title,
      description: clip(body.description, 4000),
      courseSlug: course?.slug || '',
      courseTitle: course?.title || '',
      dueAt,
      maxMarks,
      status: 'published',
      createdBy: session.displayName || session.email,
      createdByEmail: session.email,
    });

    if (course) {
      void notifyCourseStudents(course.slug, {
        type: 'assessment',
        title: `New assignment: ${title}`,
        message: `${course.title}${dueAt ? `. Due ${new Date(dueAt).toLocaleDateString()}` : ''}. Open Assignments to hand in your PDF.`,
        link: '/student/assignments',
        priority: 'high',
        sourceType: ASSIGNMENT_CLASS,
        sourceId: created.objectId,
        email: ({ name }) => assignmentPostedEmail({ name, title, courseTitle: course.title, dueAt, maxMarks, description: clip(body.description, 1500), postedBy: session.displayName || session.email }),
      });
    }
    return NextResponse.json({ ok: true, id: created.objectId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create the assignment.' }, { status: 500 });
  }
}

/** Close or reopen an assignment, or change its title, description, due date and marks. */
export async function PATCH(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isStaff(session)) return NextResponse.json({ error: 'Only teaching staff can change assignments.' }, { status: 403 });

  try {
    const body = await request.json() as { id?: string; status?: string; title?: string; description?: string; dueAt?: string; maxMarks?: number };
    const id = clip(body.id, 40);
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    const patch: Record<string, unknown> = {};
    if (body.status === 'closed' || body.status === 'published') patch.status = body.status;
    if (body.title !== undefined) patch.title = clip(body.title, 160);
    if (body.description !== undefined) patch.description = clip(body.description, 4000);
    if (body.dueAt !== undefined) {
      const date = body.dueAt ? new Date(body.dueAt) : null;
      if (date && Number.isNaN(date.getTime())) return NextResponse.json({ error: 'The due date is not valid.' }, { status: 400 });
      patch.dueAt = date ? date.toISOString() : '';
    }
    if (body.maxMarks !== undefined) patch.maxMarks = Math.min(100, Math.max(1, Number(body.maxMarks) || 20));
    if (!Object.keys(patch).length) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });
    await parseUpdate(ASSIGNMENT_CLASS, id, patch);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not update the assignment.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isStaff(session)) return NextResponse.json({ error: 'Only teaching staff can delete assignments.' }, { status: 403 });
  const id = clip(request.nextUrl.searchParams.get('id'), 40);
  if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  try {
    // Hand-ins are kept for the record: closing is the normal way to retire an assignment.
    const handIns = await findHandIns({ assignmentId: id }, 1);
    if (handIns.length) return NextResponse.json({ error: 'This assignment has hand-ins. Close it instead of deleting it.' }, { status: 409 });
    await parseServerRequest(`classes/${ASSIGNMENT_CLASS}/${id}`, { method: 'DELETE' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not delete the assignment.' }, { status: 500 });
  }
}
