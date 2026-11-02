import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Daily Essential School courses, staff, portal pages, policies and support pages.',
  alternates: { canonical: 'https://dailyessential.ca/search' },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
