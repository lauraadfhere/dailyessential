export type GradingPaper = {
  id: string;
  candidate: string;
  paper: string;
  subject: string;
  status: 'pending' | 'approved' | 'returned' | 'deleted';
  submittedAt: string;
  score: number | null;
  max: number;
};

export const gradingPapers: GradingPaper[] = [
  { id: 'gp-1', candidate: 'Amina Ahmed', paper: 'UI Critique Script A', subject: 'UI / UX Design', status: 'pending', submittedAt: '2026-10-16', score: null, max: 40 },
  { id: 'gp-2', candidate: 'Ibrahim Yusuf', paper: 'Literacy Written', subject: 'Digital Literacy', status: 'pending', submittedAt: '2026-10-15', score: null, max: 50 },
  { id: 'gp-3', candidate: 'Sara Okonkwo', paper: 'Basics Practical', subject: 'Computer Basics', status: 'approved', submittedAt: '2026-10-12', score: 42, max: 50 },
  { id: 'gp-4', candidate: 'Spam Entry', paper: 'Invalid upload', subject: '—', status: 'returned', submittedAt: '2026-10-11', score: null, max: 0 },
];

export function countPapers(status: GradingPaper['status'] | 'all') {
  if (status === 'all') return gradingPapers.length;
  return gradingPapers.filter(item => item.status === status).length;
}
