import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireRole } from '../../../../lib/authz';
import {
  CONTENT_CLASS,
  clearContentCache,
  createOverride,
  findOverrideId,
  getBuiltInLesson,
  getLessonContent,
  listEditedModules,
} from '../../../../lib/course-content';
import { getCourse } from '../../../../lib/courses-data';
import type { ModuleContent } from '../../../../lib/lesson-text';
import { parseServerRequest, parseUpdate } from '../../../../lib/parse-server';

/** Administrators edit what learners read and the activities they answer. */

const cut = (value: unknown, max: number) => String(value ?? '').slice(0, max);

function clean(input: unknown): ModuleContent | null {
  const row = input as Partial<ModuleContent> | null;
  if (!row || typeof row !== 'object') return null;
  const lessons = (Array.isArray(row.lessons) ? row.lessons : []).slice(0, 20).map((block, index) => ({
    number: index + 1,
    title: cut(block?.title, 200).trim(),
    body: cut(block?.body, 20000),
  })).filter(block => block.title || block.body.trim());

  const qcm = (Array.isArray(row.activities?.qcm) ? row.activities!.qcm : []).slice(0, 20).map(item => ({
    question: cut(item?.question, 500).trim(),
    options: (Array.isArray(item?.options) ? item.options : []).slice(0, 6).map(option => cut(option, 200).trim()).filter(Boolean),
    answer: Number(item?.answer),
  })).filter(item => item.question && item.options.length >= 2 && Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.options.length);

  const fill = (Array.isArray(row.activities?.fill) ? row.activities!.fill : []).slice(0, 20).map(item => ({
    sentence: cut(item?.sentence, 500).trim(),
    answer: cut(item?.answer, 100).trim().toLowerCase(),
  })).filter(item => item.sentence.includes('___') && item.answer);

  return {
    title: cut(row.title, 200).trim(),
    whyItMatters: cut(row.whyItMatters, 20000),
    outcomes: cut(row.outcomes, 20000),
    lessons,
    activity: cut(row.activity, 20000),
    pitfalls: cut(row.pitfalls, 20000),
    knowledgeCheck: cut(row.knowledgeCheck, 20000),
    reflection: cut(row.reflection, 20000),
    ...(qcm.length || fill.length ? { activities: { qcm, fill } } : {}),
  };
}

function target(request: NextRequest, body?: { slug?: string; index?: number }) {
  const slug = String(body?.slug ?? request.nextUrl.searchParams.get('slug') ?? '');
  const index = Number(body?.index ?? request.nextUrl.searchParams.get('index'));
  const course = getCourse(slug);
  if (!course || !Number.isInteger(index) || index < 0 || index >= course.modules.length) return null;
  return { course, index };
}

export async function GET(request: NextRequest) {
  const session = await requireRole(request, ['admin']);
  if (isResponse(session)) return session;

  if (!request.nextUrl.searchParams.get('slug')) {
    return NextResponse.json({ edited: await listEditedModules() });
  }
  const found = target(request);
  if (!found) return NextResponse.json({ error: 'Unknown course or module.' }, { status: 404 });

  const effective = await getLessonContent(found.course.title, found.index, found.course.slug);
  const builtIn = getBuiltInLesson(found.course.title, found.index);
  const edited = Boolean(await findOverrideId(found.course.slug, found.index));
  return NextResponse.json({
    lesson: effective ?? { title: found.course.modules[found.index], whyItMatters: '', outcomes: '', lessons: [], activity: '', pitfalls: '', knowledgeCheck: '', reflection: '' },
    edited,
    hasBuiltIn: Boolean(builtIn),
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireRole(request, ['admin']);
  if (isResponse(session)) return session;

  try {
    const body = await request.json() as { slug?: string; index?: number; lesson?: unknown };
    const found = target(request, body);
    if (!found) return NextResponse.json({ error: 'Unknown course or module.' }, { status: 404 });
    const lesson = clean(body.lesson);
    if (!lesson) return NextResponse.json({ error: 'The lesson is not valid.' }, { status: 400 });
    if (!lesson.title) lesson.title = found.course.modules[found.index];
    if (!lesson.whyItMatters.trim() && !lesson.lessons.length) {
      return NextResponse.json({ error: 'Add at least an introduction or one lesson section.' }, { status: 400 });
    }

    const updatedBy = session.displayName || session.email;
    const id = await findOverrideId(found.course.slug, found.index);
    if (id) await parseUpdate(CONTENT_CLASS, id, { content: JSON.stringify(lesson), updatedBy });
    else await createOverride(found.course.slug, found.index, lesson, updatedBy);
    clearContentCache();
    return NextResponse.json({ ok: true, edited: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the lesson.' }, { status: 500 });
  }
}

/** Remove the edit and go back to the built-in lesson. */
export async function DELETE(request: NextRequest) {
  const session = await requireRole(request, ['admin']);
  if (isResponse(session)) return session;
  const found = target(request);
  if (!found) return NextResponse.json({ error: 'Unknown course or module.' }, { status: 404 });
  try {
    const id = await findOverrideId(found.course.slug, found.index);
    if (id) await parseServerRequest(`classes/${CONTENT_CLASS}/${id}`, { method: 'DELETE' });
    clearContentCache();
    return NextResponse.json({ ok: true, edited: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not revert the lesson.' }, { status: 500 });
  }
}
