import type { ReactNode } from 'react';

export const metadata = {
  title: 'Daily Essential School Admin',
  description: 'School management dashboard for evaluations, lessons and news.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
