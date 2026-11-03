import { isParseConfigured, parseCreateEnsured, parseQuery } from './parse-server';

/** Moodle-style assignments: a teacher posts one, learners hand in a PDF, the teacher grades it out of 20 with notes. */

export const ASSIGNMENT_CLASS = 'CourseAssignment';
export const ASSIGNMENT_FIELDS = {
  title: { type: 'String' },
  description: { type: 'String' },
  courseSlug: { type: 'String' },
  courseTitle: { type: 'String' },
  dueAt: { type: 'String' },
  maxMarks: { type: 'Number' },
  status: { type: 'String' },
  createdBy: { type: 'String' },
  createdByEmail: { type: 'String' },
} as const;

export const HANDIN_CLASS = 'AssignmentSubmission';
export const HANDIN_FIELDS = {
  assignmentId: { type: 'String' },
  assignmentTitle: { type: 'String' },
  courseSlug: { type: 'String' },
  studentEmail: { type: 'String' },
  studentName: { type: 'String' },
  fileUrl: { type: 'String' },
  fileName: { type: 'String' },
  note: { type: 'String' },
  status: { type: 'String' },
  marks: { type: 'Number' },
  maxMarks: { type: 'Number' },
  feedback: { type: 'String' },
  gradedBy: { type: 'String' },
  gradedAt: { type: 'String' },
  submittedAt: { type: 'String' },
  late: { type: 'Boolean' },
} as const;

export type AssignmentRow = {
  objectId: string; title: string; description?: string; courseSlug?: string; courseTitle?: string;
  dueAt?: string; maxMarks?: number; status?: string; createdBy?: string; createdByEmail?: string; createdAt?: string;
};

export type HandInRow = {
  objectId: string; assignmentId: string; assignmentTitle?: string; courseSlug?: string; studentEmail: string; studentName?: string;
  fileUrl?: string; fileName?: string; note?: string; status: 'submitted' | 'graded'; marks?: number; maxMarks?: number;
  feedback?: string; gradedBy?: string; gradedAt?: string; submittedAt?: string; late?: boolean;
};

export const mapAssignment = (row: AssignmentRow) => ({
  id: row.objectId,
  title: row.title,
  description: row.description || '',
  courseSlug: row.courseSlug || '',
  courseTitle: row.courseTitle || '',
  dueAt: row.dueAt || '',
  maxMarks: row.maxMarks ?? 20,
  status: row.status || 'published',
  createdBy: row.createdBy || '',
  createdAt: row.createdAt || '',
});

export const mapHandIn = (row: HandInRow) => ({
  id: row.objectId,
  assignmentId: row.assignmentId,
  assignmentTitle: row.assignmentTitle || '',
  courseSlug: row.courseSlug || '',
  studentEmail: row.studentEmail,
  studentName: row.studentName || row.studentEmail.split('@')[0],
  fileUrl: row.fileUrl || '',
  fileName: row.fileName || '',
  note: row.note || '',
  status: row.status,
  marks: row.marks ?? null,
  maxMarks: row.maxMarks ?? null,
  feedback: row.feedback || '',
  gradedBy: row.gradedBy || '',
  gradedAt: row.gradedAt || '',
  submittedAt: row.submittedAt || '',
  late: Boolean(row.late),
});

export async function findAssignments(where: Record<string, unknown>, limit = 100) {
  if (!isParseConfigured()) return [] as AssignmentRow[];
  try {
    return (await parseQuery<AssignmentRow>(ASSIGNMENT_CLASS, { where: JSON.stringify(where), limit, order: '-createdAt' })).results || [];
  } catch { return []; }
}

export async function findHandIns(where: Record<string, unknown>, limit = 300) {
  if (!isParseConfigured()) return [] as HandInRow[];
  try {
    return (await parseQuery<HandInRow>(HANDIN_CLASS, { where: JSON.stringify(where), limit, order: '-createdAt' })).results || [];
  } catch { return []; }
}

export const createAssignment = (body: Omit<AssignmentRow, 'objectId'>) => parseCreateEnsured(ASSIGNMENT_CLASS, ASSIGNMENT_FIELDS, body);
export const createHandIn = (body: Omit<HandInRow, 'objectId'>) => parseCreateEnsured(HANDIN_CLASS, HANDIN_FIELDS, body);
