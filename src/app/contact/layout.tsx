import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & support',
  description:
    'Contact Daily Essential School — portal support, academic office, finance desk and campus front desk, with a trackable support ticket form.',
  alternates: { canonical: 'https://dailyessential.school/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
