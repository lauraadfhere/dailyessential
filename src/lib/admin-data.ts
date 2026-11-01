export type EvaluationStatus = 'pending' | 'approved' | 'spam' | 'deleted' | 'all';
export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'cancelled' | 'all';
export type NewsStatus = 'draft' | 'published' | 'archived' | 'all';

export type EvaluationRequestItem = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  programme: string;
  message: string;
  status: Exclude<EvaluationStatus, 'all'>;
  priority: 'normal' | 'high';
  createdAt: string;
};

export type LessonSubscriptionItem = {
  id: string;
  subscriberName: string;
  subscriberEmail: string;
  lessonTitle: string;
  plan: string;
  status: Exclude<SubscriptionStatus, 'all'>;
  amountLabel: string;
  createdAt: string;
};

export type NewsUpdateItem = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: Exclude<NewsStatus, 'all'>;
  authorName: string;
  publishedAt: string;
  pinned: boolean;
};

export type LessonItem = {
  id: string;
  title: string;
  summary: string;
  level: string;
  seats: number;
  priceLabel: string;
  status: 'open' | 'full' | 'closed';
};

export const adminCampuses = [
  { id: 'main', name: 'Daily Essential Main Campus', learners: 842 },
  { id: 'digital', name: 'Digital Learning Hub', learners: 316 },
  { id: 'evening', name: 'Evening Programme', learners: 128 },
];

export const evaluationRequests: EvaluationRequestItem[] = [
  {
    id: 'ev-1001',
    requesterName: 'Fatima Diallo',
    requesterEmail: 'fatima.diallo@email.com',
    subject: 'Placement evaluation — UI / UX Design',
    programme: 'UI / UX Design',
    message: 'I completed a foundation course and would like a skills placement evaluation before enrolling.',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-10-16T09:20:00Z',
  },
  {
    id: 'ev-1002',
    requesterName: 'Kwame Mensah',
    requesterEmail: 'kwame.m@email.com',
    subject: 'Transfer credit review',
    programme: 'Digital Literacy',
    message: 'Please evaluate my prior learning certificates for transfer into the Digital Literacy track.',
    status: 'pending',
    priority: 'normal',
    createdAt: '2026-10-15T14:05:00Z',
  },
  {
    id: 'ev-1003',
    requesterName: 'Sara Okonkwo',
    requesterEmail: 'sara.o@email.com',
    subject: 'Language readiness check',
    programme: 'Computer Basics',
    message: 'Requesting an English readiness evaluation for the Computer Basics evening class.',
    status: 'approved',
    priority: 'normal',
    createdAt: '2026-10-12T11:40:00Z',
  },
  {
    id: 'ev-1004',
    requesterName: 'Spam Bot',
    requesterEmail: 'offer@cheap-certs.biz',
    subject: 'Buy certificates online',
    programme: '—',
    message: 'Cheap certificates available now.',
    status: 'spam',
    priority: 'normal',
    createdAt: '2026-10-11T08:00:00Z',
  },
];

export const lessonSubscriptions: LessonSubscriptionItem[] = [
  {
    id: 'sub-2001',
    subscriberName: 'Amina Ahmed',
    subscriberEmail: 'student@bifti.school',
    lessonTitle: 'UI / UX Studio Workshops',
    plan: 'Term subscription',
    status: 'active',
    amountLabel: '₦45,000 / term',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'sub-2002',
    subscriberName: 'Ibrahim Yusuf',
    subscriberEmail: 'ibrahim.y@email.com',
    lessonTitle: 'Digital Literacy Path',
    plan: 'Monthly',
    status: 'pending',
    amountLabel: '₦18,000 / month',
    createdAt: '2026-10-17T16:22:00Z',
  },
  {
    id: 'sub-2003',
    subscriberName: 'Chloe Nwosu',
    subscriberEmail: 'chloe.n@email.com',
    lessonTitle: 'Computer Basics Evening',
    plan: 'Monthly',
    status: 'paused',
    amountLabel: '₦12,500 / month',
    createdAt: '2026-08-21T12:10:00Z',
  },
];

export const newsUpdates: NewsUpdateItem[] = [
  {
    id: 'news-3001',
    title: 'New learning resources available',
    summary: 'The Daily Essential digital library has been updated with new resources and support materials.',
    body: 'Students and staff can now access updated reading lists, workshop recordings and practice kits in the digital library. Visit Learning → Library from your portal to explore the collection.',
    category: 'Updates',
    status: 'published',
    authorName: 'School Office',
    publishedAt: '2026-10-14T08:00:00Z',
    pinned: true,
  },
  {
    id: 'news-3002',
    title: 'Evaluation week opens Monday',
    summary: 'Placement and transfer evaluations can be requested from the school portal this week.',
    body: 'Evaluation requests submitted before Friday will be reviewed within five working days. Bring any prior certificates when you visit campus for in-person assessment.',
    category: 'Academics',
    status: 'published',
    authorName: 'Academic Coordinator',
    publishedAt: '2026-10-13T09:30:00Z',
    pinned: false,
  },
  {
    id: 'news-3003',
    title: 'Evening lesson subscriptions',
    summary: 'Computer Basics evening seats are open for October enrolment.',
    body: 'Subscribe from the Lessons page. Seats are limited; pending subscriptions are confirmed after payment verification.',
    category: 'Lessons',
    status: 'draft',
    authorName: 'Admissions',
    publishedAt: '2026-10-18T07:00:00Z',
    pinned: false,
  },
];

export const lessonsCatalog: LessonItem[] = [
  {
    id: 'les-1',
    title: 'UI / UX Studio Workshops',
    summary: 'Weekly studio sessions with critique and portfolio coaching.',
    level: 'Intermediate',
    seats: 18,
    priceLabel: '₦45,000 / term',
    status: 'open',
  },
  {
    id: 'les-2',
    title: 'Digital Literacy Path',
    summary: 'Foundational digital skills for learners and parents.',
    level: 'Beginner',
    seats: 30,
    priceLabel: '₦18,000 / month',
    status: 'open',
  },
  {
    id: 'les-3',
    title: 'Computer Basics Evening',
    summary: 'After-hours classes for working learners.',
    level: 'Beginner',
    seats: 0,
    priceLabel: '₦12,500 / month',
    status: 'full',
  },
];

export function countByStatus<T extends string>(items: { status: T }[], status: T | 'all') {
  if (status === 'all') return items.length;
  return items.filter(item => item.status === status).length;
}

export function formatAdminDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}
