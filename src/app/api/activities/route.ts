import { NextRequest, NextResponse } from 'next/server';
import { isResponse, isStaff, requireUser } from '../../../lib/authz';
import { getCourse } from '../../../lib/courses-data';
import {
  SUBMISSION_CLASS,
  createSubmission,
  findSubmissions,
  gradeQuiz,
  mapSubmission,
  tasksFor,
} from '../../../lib/learning';
import { gradeEmail, staffAlertEmail } from '../../../lib/email/templates';
import { notifyEmails, notifyStaff } from '../../../lib/notify';
import { isParseConfigured, parseQuery, parseUpdate } from '../../../lib/parse-server';

async function isEnrolled(email: string, courseSlug: string) {
  try {
    const data = await parseQuery<{ status?: string }>('CourseEnrollment', {
      where: JSON.stringify({ studentEmail: email, courseSlug }),
      limit: 1,
    });
    return ['active', 'completed'].includes(data.results?.[0]?.status || '');
  } catch {
    return false;
  }
}

/**
 * Learners: their own submissions (optionally for one course / lesson).
 * Staff: `?queue=1` lists work waiting to be graded; `?email=` shows one learner.
 */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { submissions: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ submissions: [], configured: false });

  const params = request.nextUrl.searchParams;
  const staff = isStaff(session);
  const where: Record<string, unknown> = {};

  const courseSlug = params.get('courseSlug');
  if (courseSlug) where.courseSlug = courseSlug;
  const lessonIndex = params.get('lessonIndex');
  if (lessonIndex !== null && lessonIndex !== '' && Number.isInteger(Number(lessonIndex))) where.lessonIndex = Number(lessonIndex);

  if (staff) {
    const email = (params.get('email') || '').trim().toLowerCase();
    if (email) where.studentEmail = email;
    if (params.get('queue') === '1') { where.status = 'submitted'; where.kind = 'task'; }
    else if (params.get('status')) where.status = params.get('status');
  } else {
    where.studentEmail = session.email;
  }

  const rows = await findSubmissions(where, staff ? 150 : 300);
  return NextResponse.json({ submissions: rows.map(mapSubmission), configured: true });
}

/** Submit a quiz attempt (graded on the server) or a written task (graded by a teacher). */
export async function POST(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ error: 'Submissions are unavailable until the school database is configured.' }, { status: 503 });

  try {
    const body = await request.json() as {
      courseSlug?: string; lessonIndex?: number; kind?: string; taskKey?: string; text?: string; qcm?: unknown; fill?: unknown;
    };
    const course = body.courseSlug ? getCourse(body.courseSlug) : undefined;
    const lessonIndex = Number(body.lessonIndex);
    if (!course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 });
    if (!Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.modules.length) {
      return NextResponse.json({ error: 'Unknown lesson.' }, { status: 400 });
    }

    const enrolled = await isEnrolled(session.email, course.slug);
    const base = {
      studentEmail: session.email,
      studentName: session.displayName || session.email.split('@')[0],
      courseSlug: course.slug,
      courseTitle: course.title,
      lessonIndex,
    };

    if (body.kind === 'quiz') {
      const result = await gradeQuiz(course, lessonIndex, body);
      if (!result) return NextResponse.json({ error: 'This module has no quiz.' }, { status: 404 });
      if (!enrolled) return NextResponse.json({ ...result, saved: false, notice: 'Enrol in this course to save your quiz results.' });

      const existing = (await findSubmissions({ studentEmail: session.email, courseSlug: course.slug, lessonIndex, kind: 'quiz' }, 1))[0];
      const payload = {
        ...base, kind: 'quiz' as const, taskKey: 'quiz', score: result.score, maxScore: result.max,
        answers: JSON.stringify({ qcm: body.qcm ?? [], fill: body.fill ?? [] }),
        status: 'graded' as const, submittedAt: new Date().toISOString(),
      };
      // Keep the best attempt: a retry can improve the recorded score but never lower it.
      if (existing) {
        // The latest answers are always kept (the AI notes are built from them); the score only goes up.
        await parseUpdate(SUBMISSION_CLASS, existing.objectId, (existing.score ?? 0) < result.score ? payload : { answers: payload.answers, submittedAt: payload.submittedAt });
      } else {
        await createSubmission(payload);
      }
      return NextResponse.json({ ...result, saved: true, best: Math.max(existing?.score ?? 0, result.score) });
    }

    if (body.kind === 'task') {
      const task = (await tasksFor(course, lessonIndex)).find(item => item.key === body.taskKey);
      if (!task) return NextResponse.json({ error: 'Unknown task.' }, { status: 404 });
      if (!enrolled) return NextResponse.json({ error: 'Enrol in this course before submitting tasks.' }, { status: 403 });
      const text = String(body.text || '').trim().slice(0, 6000);
      if (text.length < 10) return NextResponse.json({ error: 'Write a little more before submitting (at least 10 characters).' }, { status: 400 });

      const existing = (await findSubmissions({ studentEmail: session.email, courseSlug: course.slug, lessonIndex, taskKey: task.key }, 1))[0];
      const payload = {
        ...base, kind: 'task' as const, taskKey: task.key, text,
        status: 'submitted' as const, submittedAt: new Date().toISOString(),
        // A resubmission goes back to the teacher with the old marks cleared.
        marks: undefined, maxMarks: undefined, feedback: '', gradedBy: '', gradedAt: '',
      };
      if (existing) {
        await parseUpdate(SUBMISSION_CLASS, existing.objectId, { ...payload, marks: { __op: 'Delete' }, maxMarks: { __op: 'Delete' } });
        void notifyStaff({ type: 'assessment', title: `Task re-submitted: ${course.title}`, message: `${base.studentName} re-submitted "${task.label}" for module ${lessonIndex + 1}.`, link: '/teacher/marks', sourceType: SUBMISSION_CLASS, sourceId: existing.objectId }, ['teacher', 'examiner']);
        return NextResponse.json({ ok: true, id: existing.objectId, status: 'submitted', resubmitted: true });
      }
      const created = await createSubmission(payload);
      void notifyStaff({ type: 'assessment', title: `New task to grade: ${course.title}`, message: `${base.studentName} submitted "${task.label}" for module ${lessonIndex + 1}.`, link: '/teacher/marks', sourceType: SUBMISSION_CLASS, sourceId: created.objectId, email: ({ name }) => staffAlertEmail({ name, learner: base.studentName, subject: `${task.label} (module ${lessonIndex + 1})`, courseTitle: course.title, excerpt: text.slice(0, 400), kind: 'task', link: '/teacher/marks' }) }, ['teacher', 'examiner']);
      return NextResponse.json({ ok: true, id: created.objectId, status: 'submitted' });
    }

    return NextResponse.json({ error: 'kind must be quiz or task.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save your work.' }, { status: 500 });
  }
}

/** Teachers, examiners and admins give marks, a letter grade and feedback on a submitted task. */
export async function PATCH(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isStaff(session)) return NextResponse.json({ error: 'Only teaching staff can grade work.' }, { status: 403 });

  try {
    const body = await request.json() as { id?: string; marks?: number; maxMarks?: number; feedback?: string };
    const id = String(body.id || '').trim();
    const maxMarks = Math.min(1000, Math.max(1, Number(body.maxMarks ?? 10) || 10));
    const marks = Number(body.marks);
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    if (!Number.isFinite(marks) || marks < 0 || marks > maxMarks) {
      return NextResponse.json({ error: `Marks must be a number from 0 to ${maxMarks}.` }, { status: 400 });
    }

    const found = (await findSubmissions({ objectId: id }, 1))[0];
    if (!found || found.kind !== 'task') return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });

    const feedback = String(body.feedback || '').trim().slice(0, 2000);
    const gradedAt = new Date().toISOString();
    await parseUpdate(SUBMISSION_CLASS, id, {
      marks: Math.round(marks * 10) / 10, maxMarks, feedback, status: 'graded', gradedBy: session.displayName || session.email, gradedAt,
    });

    // Tell the learner (in the app, and by e-mail once SMTP is set up). A failure here never undoes the grade.
    const link = `/courses/${found.courseSlug}/reader/${found.lessonIndex}`;
    await notifyEmails([found.studentEmail], {
      type: 'assessment',
      title: `Your work was graded: ${marks}/${maxMarks}`,
      message: `${found.courseTitle || found.courseSlug}, module ${found.lessonIndex + 1}. ${feedback || 'Open your progress report for details.'}`,
      priority: 'normal',
      link,
      sourceType: SUBMISSION_CLASS,
      sourceId: id,
      email: ({ name }) => gradeEmail({ name, courseTitle: found.courseTitle || found.courseSlug, itemTitle: `${found.taskKey === 'reflection' ? 'Reflection' : 'Guided practical activity'} (module ${found.lessonIndex + 1})`, kind: 'task', marks, max: maxMarks, feedback, gradedBy: session.displayName || session.email, link }),
    });

    return NextResponse.json({ ok: true, id, marks, maxMarks, status: 'graded' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the grade.' }, { status: 500 });
  }
}
