import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admissions',
  description:
    'Apply online to Daily Essential School: upload the required documents, book the placement check and follow every stage of the admission decision.',
  alternates: { canonical: 'https://dailyessential.school/admissions' },
};

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
