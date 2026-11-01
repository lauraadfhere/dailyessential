import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Daily Essential School platform pricing per learner, per month, in Algerian dinar (DZD) and US dollars (USD), with annual saving and optional add-ons.',
  alternates: { canonical: 'https://dailyessential.school/pricing' },
  openGraph: {
    title: 'Daily Essential School pricing — DZD and USD',
    description: 'Clear monthly plans per learner, billed in DZD or USD, with annual saving and optional add-ons.',
    url: 'https://dailyessential.school/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
