import {
  evaluationRequests,
  lessonSubscriptions,
  newsUpdates,
  type EvaluationRequestItem,
  type LessonSubscriptionItem,
  type NewsUpdateItem,
} from './admin-data';
import { escapeRegex } from './authz';
import { resolveMediaUrl } from './cloudinary';
import { isParseConfigured, parseQuery } from './parse-server';

export type CourseRow = {
  objectId: string;
  title: string;
  summary?: string;
  level?: string;
  programme?: string;
  status?: string;
  seats?: number;
  coverUrl?: string;
  coverPublicId?: string;
};

export type DocumentRow = {
  objectId: string;
  title: string;
  summary?: string;
  category?: string;
  programme?: string;
  fileUrl: string;
  filePublicId?: string;
  mimeType?: string;
  pages?: number;
  status: string;
  visibility?: string;
  uploadedByName?: string;
  createdAt?: string;
};

export type TicketRow = {
  objectId: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  category: string;
  priority?: string;
  status: string;
  message: string;
  attachmentUrl?: string;
  createdAt?: string;
};

function isoDate(value?: string | { iso?: string }) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  return value.iso || new Date().toISOString();
}

export async function fetchCourses(limit = 50) {
  if (!isParseConfigured()) return [] as Array<ReturnType<typeof mapCourse>>;
  try {
    const data = await parseQuery<CourseRow>('Course', { limit, order: 'title' });
    return (data.results || []).map(mapCourse);
  } catch {
    return [];
  }
}

function mapCourse(row: CourseRow) {
  return {
    id: row.objectId,
    title: row.title,
    summary: row.summary || '',
    level: row.level || '',
    programme: row.programme || '',
    status: row.status || 'open',
    seats: row.seats || 0,
    coverUrl: resolveMediaUrl(row.coverUrl, 'course', row.title, row.coverPublicId),
  };
}

export async function fetchDocuments(params: { q?: string; category?: string; programme?: string; limit?: number } = {}) {
  if (!isParseConfigured()) return [] as Array<ReturnType<typeof mapDocument>>;
  try {
    const where: Record<string, unknown> = { status: 'published' };
    if (params.category) where.category = params.category;
    if (params.programme) where.programme = params.programme;
    if (params.q) {
      where.$or = [
        { title: { $regex: escapeRegex(params.q.slice(0, 80)), $options: 'i' } },
        { summary: { $regex: escapeRegex(params.q.slice(0, 80)), $options: 'i' } },
        { category: { $regex: escapeRegex(params.q.slice(0, 80)), $options: 'i' } },
      ];
    }
    const data = await parseQuery<DocumentRow>('LearningDocument', {
      where: JSON.stringify(where),
      limit: params.limit || 40,
      order: '-createdAt',
    });
    return (data.results || []).map(mapDocument);
  } catch {
    return [];
  }
}

function mapDocument(row: DocumentRow) {
  return {
    id: row.objectId,
    title: row.title,
    summary: row.summary || '',
    category: row.category || 'General',
    programme: row.programme || '',
    fileUrl: row.fileUrl,
    filePublicId: row.filePublicId || '',
    mimeType: row.mimeType || 'application/pdf',
    pages: row.pages || 0,
    status: row.status,
    visibility: row.visibility || 'students',
    uploadedByName: row.uploadedByName || 'Daily Essential Library',
    createdAt: row.createdAt || '',
  };
}

export async function fetchTickets(limit = 50) {
  if (!isParseConfigured()) return [] as Array<ReturnType<typeof mapTicket>>;
  try {
    const data = await parseQuery<TicketRow>('SupportTicket', { limit, order: '-createdAt' });
    return (data.results || []).map(mapTicket);
  } catch {
    return [];
  }
}

function mapTicket(row: TicketRow) {
  return {
    id: row.objectId,
    requesterName: row.requesterName,
    requesterEmail: row.requesterEmail,
    subject: row.subject,
    category: row.category,
    priority: row.priority || 'normal',
    status: row.status,
    message: row.message,
    attachmentUrl: row.attachmentUrl || '',
    createdAt: row.createdAt || '',
  };
}

export async function fetchStudentByIdOrEmail(idOrEmail: string) {
  if (!isParseConfigured() || !idOrEmail) return null;
  const where = idOrEmail.includes('@')
    ? { email: idOrEmail }
    : { $or: [{ objectId: idOrEmail }, { studentId: idOrEmail }] };
  try {
    const data = await parseQuery<Record<string, unknown>>('StudentProfile', {
      where: JSON.stringify(where),
      limit: 1,
    });
    const row = data.results?.[0];
    if (!row) return null;
    return {
      id: String(row.objectId),
      fullName: String(row.fullName || ''),
      email: String(row.email || ''),
      studentId: String(row.studentId || ''),
      backupSerial: String(row.backupSerial || ''),
      barcodeValue: String(row.barcodeValue || ''),
      classGroup: String(row.classGroup || ''),
      gradeLevel: String(row.gradeLevel || ''),
      programme: String(row.programme || ''),
      campus: String(row.campus || ''),
      status: String(row.status || 'active'),
      deliveryMode: String(row.deliveryMode || ''),
      guardian: String(row.guardian || ''),
      guardianEmail: String(row.guardianEmail || ''),
      attendance: String(row.attendance || ''),
      avatarUrl: resolveMediaUrl(String(row.avatarUrl || ''), 'avatar', String(row.fullName || 'Student'), String(row.avatarPublicId || '')),
      phone: String(row.phone || ''),
      country: String(row.country || ''),
      address: String(row.address || ''),
    };
  } catch {
    return null;
  }
}

type ParseEval = {
  objectId: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  programme?: string;
  message?: string;
  status: string;
  priority?: string;
  createdAt: string;
};

export async function fetchEvaluations(options: { demo?: boolean } = {}): Promise<EvaluationRequestItem[]> {
  const demo = options.demo !== false;
  if (!isParseConfigured()) return demo ? evaluationRequests : [];
  try {
    const data = await parseQuery<ParseEval>('EvaluationRequest', { limit: 100, order: '-createdAt' });
    if (!data.results?.length) return demo ? evaluationRequests : [];
    return data.results.map(row => ({
      id: row.objectId,
      requesterName: row.requesterName,
      requesterEmail: row.requesterEmail,
      subject: row.subject,
      programme: row.programme || '',
      message: row.message || '',
      status: (row.status as EvaluationRequestItem['status']) || 'pending',
      priority: row.priority === 'high' ? 'high' : 'normal',
      createdAt: isoDate(row.createdAt),
    }));
  } catch {
    return demo ? evaluationRequests : [];
  }
}

type ParseNews = {
  objectId: string;
  title: string;
  summary?: string;
  body: string;
  category?: string;
  status: string;
  authorName?: string;
  publishedAt?: { iso?: string } | string;
  pinned?: boolean;
};

export async function fetchNews(options: { demo?: boolean } = {}): Promise<NewsUpdateItem[]> {
  const demo = options.demo !== false;
  if (!isParseConfigured()) return demo ? newsUpdates : [];
  try {
    const data = await parseQuery<ParseNews>('NewsUpdate', { limit: 100, order: '-publishedAt' });
    if (!data.results?.length) return demo ? newsUpdates : [];
    return data.results.map(row => ({
      id: row.objectId,
      title: row.title,
      summary: row.summary || '',
      body: row.body,
      category: row.category || 'General',
      status: (row.status as NewsUpdateItem['status']) || 'draft',
      authorName: row.authorName || 'Daily Essential Admin',
      publishedAt: isoDate(row.publishedAt as string | { iso?: string }),
      pinned: Boolean(row.pinned),
    }));
  } catch {
    return demo ? newsUpdates : [];
  }
}

type ParseSub = {
  objectId: string;
  subscriberName: string;
  subscriberEmail: string;
  plan?: string;
  status: string;
  amountLabel?: string;
  createdAt: string;
  lesson?: { objectId?: string };
};

export async function fetchSubscriptions(options: { demo?: boolean } = {}): Promise<LessonSubscriptionItem[]> {
  const demo = options.demo !== false;
  if (!isParseConfigured()) return demo ? lessonSubscriptions : [];
  try {
    const data = await parseQuery<ParseSub>('LessonSubscription', { limit: 100, order: '-createdAt' });
    if (!data.results?.length) return demo ? lessonSubscriptions : [];
    return data.results.map(row => ({
      id: row.objectId,
      subscriberName: row.subscriberName,
      subscriberEmail: row.subscriberEmail,
      lessonTitle: row.plan || 'Lesson subscription',
      plan: row.plan || 'Standard',
      status: (row.status as LessonSubscriptionItem['status']) || 'pending',
      amountLabel: row.amountLabel || '—',
      createdAt: isoDate(row.createdAt),
    }));
  } catch {
    return demo ? lessonSubscriptions : [];
  }
}
