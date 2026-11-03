import { NextRequest, NextResponse } from 'next/server';
import { isResponse, requireUser } from '../../../lib/authz';
import { getCourse } from '../../../lib/courses-data';
import { NOTE_CLASS, NOTE_FIELDS, findNotes, mapNote } from '../../../lib/notes';
import { isParseConfigured, parseCreateEnsured, parseServerRequest } from '../../../lib/parse-server';

const clip = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

/** The signed-in learner's own notes (all, or for one course / module). */
export async function GET(request: NextRequest) {
  const session = await requireUser(request, { notes: [] });
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ notes: [] });

  const where: Record<string, unknown> = { studentEmail: session.email };
  const courseSlug = clip(request.nextUrl.searchParams.get('courseSlug'), 80);
  if (courseSlug) where.courseSlug = courseSlug;
  const lesson = request.nextUrl.searchParams.get('lessonIndex');
  if (lesson !== null && lesson !== '' && Number.isInteger(Number(lesson))) where.lessonIndex = Number(lesson);
  const rows = await findNotes(where, 100);
  return NextResponse.json({ notes: rows.map(mapNote) }, { headers: { 'Cache-Control': 'private, no-store' } });
}

/** Save a note written by hand. */
export async function POST(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  if (!isParseConfigured()) return NextResponse.json({ error: 'Notes are unavailable until the school database is configured.' }, { status: 503 });
  try {
    const body = await request.json() as { courseSlug?: string; lessonIndex?: number; title?: string; text?: string };
    const course = body.courseSlug ? getCourse(String(body.courseSlug)) : undefined;
    const lessonIndex = Number(body.lessonIndex);
    if (!course || !Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.modules.length) {
      return NextResponse.json({ error: 'Unknown course or module.' }, { status: 404 });
    }
    const text = clip(body.text, 6000);
    if (text.length < 3) return NextResponse.json({ error: 'Write something first.' }, { status: 400 });
    const created = await parseCreateEnsured(NOTE_CLASS, NOTE_FIELDS, {
      studentEmail: session.email,
      courseSlug: course.slug,
      courseTitle: course.title,
      lessonIndex,
      title: clip(body.title, 140) || `My note · module ${lessonIndex + 1}`,
      content: text,
      source: 'manual',
      createdAtIso: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, id: created.objectId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save the note.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireUser(request);
  if (isResponse(session)) return session;
  const id = clip(request.nextUrl.searchParams.get('id'), 40);
  if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  // Ownership is part of the lookup, so nobody can delete another learner's note.
  const mine = (await findNotes({ objectId: id, studentEmail: session.email }, 1))[0];
  if (!mine) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
  try {
    await parseServerRequest(`classes/${NOTE_CLASS}/${id}`, { method: 'DELETE' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not delete the note.' }, { status: 500 });
  }
}
