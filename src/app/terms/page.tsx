import InformationPage from '../../components/information-page';

export const metadata = {
  title: 'Terms of use · Daily Essential School',
  description: 'The terms that govern use of the Daily Essential School website, portal, courses, enrolment and AI assistance.',
  alternates: { canonical: 'https://dailyessential.school/terms' },
};

export default function TermsPage() {
  return <InformationPage docKey="terms" />;
}
