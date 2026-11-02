import InformationPage from '../../components/information-page';

export const metadata = {
  title: 'Policies · Daily Essential School',
  description: 'Student conduct, safeguarding, attendance, academic integrity and support policies at Daily Essential School.',
  alternates: { canonical: 'https://dailyessential.ca/policies' },
};

export default function PoliciesPage() {
  return <InformationPage docKey="policies" />;
}
