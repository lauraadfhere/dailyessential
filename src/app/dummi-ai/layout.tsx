import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DAMMI AI study buddy',
  description:
    'DAMMI AI is the Daily Essential School study buddy — guided answers on courses, portal access, student ID and support, powered by NVIDIA NIM.',
  alternates: { canonical: 'https://dailyessential.school/dummi-ai' },
  openGraph: {
    title: 'DAMMI AI · Daily Essential School',
    description: 'Guided answers for learners and staff — courses, portal access, identity and support.',
    url: 'https://dailyessential.school/dummi-ai',
  },
};

export default function DummiAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
