import { getLessonContent } from './course-content';
import type { Course } from './courses-data';
import { isParseConfigured, parseCreateEnsured, parseQuery } from './parse-server';

/** Server-side data access for activities, tasks and grades. */

export const SUBMISSION_CLASS = 'ActivitySubmission';
export const SUBMISSION_FIELDS = {
  studentEmail: { type: 'String' },
  studentName: { type: 'String' },
  courseSlug: { type: 'String' },
  courseTitle: { type: 'String' },
  lessonIndex: { type: 'Number' },
  kind: { type: 'String' },
  taskKey: { type: 'String' },
  text: { type: 'String' },
  answers: { type: 'String' },
  score: { type: 'Number' },
  maxScore: { type: 'Number' },
  status: { type: 'String' },
  marks: { type: 'Number' },
  maxMarks: { type: 'Number' },
  feedback: { type: 'String' },
  gradedBy: { type: 'String' },
  gradedAt: { type: 'String' },
  submittedAt: { type: 'String' },
} as const;

export type SubmissionRow = {
  objectId: string;
  studentEmail: string;
  studentName?: string;
  courseSlug: string;
  courseTitle?: string;
  lessonIndex: number;
  kind: 'quiz' | 'task';
  taskKey: string;
  text?: string;
  answers?: string;
  score?: number;
  maxScore?: number;
  status: 'submitted' | 'graded';
  marks?: number;
  maxMarks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  submittedAt?: string;
};

export function mapSubmission(row: SubmissionRow) {
  return {
    id: row.objectId,
    studentEmail: row.studentEmail,
    studentName: row.studentName || '',
    courseSlug: row.courseSlug,
    courseTitle: row.courseTitle || '',
    lessonIndex: row.lessonIndex,
    kind: row.kind,
    taskKey: row.taskKey,
    text: row.text || '',
    score: row.score ?? null,
    maxScore: row.maxScore ?? null,
    status: row.status,
    marks: row.marks ?? null,
    maxMarks: row.maxMarks ?? null,
    feedback: row.feedback || '',
    gradedBy: row.gradedBy || '',
    gradedAt: row.gradedAt || '',
    submittedAt: row.submittedAt || '',
  };
}

export type Submission = ReturnType<typeof mapSubmission>;

export async function findSubmissions(where: Record<string, unknown>, limit = 200) {
  if (!isParseConfigured()) return [] as SubmissionRow[];
  try {
    const data = await parseQuery<SubmissionRow>(SUBMISSION_CLASS, { where: JSON.stringify(where), limit, order: '-createdAt' });
    return data.results || [];
  } catch {
    return []; // class not created yet
  }
}

export async function createSubmission(body: Omit<SubmissionRow, 'objectId'>) {
  return parseCreateEnsured(SUBMISSION_CLASS, SUBMISSION_FIELDS, body);
}

/** Which graded tasks a lesson has. Every module with text for these sections gets a task. */
export async function tasksFor(course: Course, lessonIndex: number) {
  const lesson = await getLessonContent(course.title, lessonIndex, course.slug);
  const tasks: { key: 'practical' | 'reflection'; label: string }[] = [];
  if (lesson?.activity?.trim()) tasks.push({ key: 'practical', label: 'Guided practical activity' });
  if (lesson?.reflection?.trim()) tasks.push({ key: 'reflection', label: 'Reflection and completion evidence' });
  return tasks;
}

/** Grade a quiz attempt against the answer key. Answer keys never leave the server. */
export async function gradeQuiz(course: Course, lessonIndex: number, input: { qcm?: unknown; fill?: unknown }) {
  const activities = (await getLessonContent(course.title, lessonIndex, course.slug))?.activities;
  if (!activities) return null;
  const picked = Array.isArray(input.qcm) ? input.qcm : [];
  const typed = Array.isArray(input.fill) ? input.fill : [];

  const qcm = activities.qcm.map((question, index) => ({
    correct: Number(picked[index]) === question.answer,
    correctIndex: question.answer ?? -1,
  }));
  const fill = activities.fill.map((item, index) => {
    const given = String(typed[index] ?? '').trim().toLowerCase();
    return { correct: given !== '' && given === String(item.answer ?? '').trim().toLowerCase(), expected: item.answer ?? '' };
  });
  const score = qcm.filter(row => row.correct).length + fill.filter(row => row.correct).length;
  return { qcm, fill, score, max: qcm.length + fill.length };
}
