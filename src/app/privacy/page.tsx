import InformationPage from '../../components/information-page';

export const metadata = {
  title: 'Privacy policy · Daily Essential School',
  description: 'How Daily Essential School collects, protects and retains personal information, including AI features and cookies.',
  alternates: { canonical: 'https://dailyessential.ca/privacy' },
};

export default function PrivacyPage() {
  return <InformationPage docKey="privacy" />;
}
