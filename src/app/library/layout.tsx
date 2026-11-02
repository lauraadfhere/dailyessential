import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF library',
  description:
    'Read the Daily Essential School PDF library in the in-app reader — course packs, revision guides and school documents.',
  alternates: { canonical: 'https://dailyessential.ca/library' },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
