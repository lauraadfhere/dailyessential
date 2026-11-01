import ConsoleShell from '../../../components/console-shell';

const bank = [
  ['QB-101', 'UI critique rubric item', 'UI / UX Design', 'Active'],
  ['QB-204', 'Digital literacy MCQ set', 'Digital Literacy', 'Active'],
  ['QB-318', 'Basics practical checklist', 'Computer Basics', 'Draft'],
];

export default function ExaminerQuestionsPage() {
  return (
    <ConsoleShell role="examiner" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Question bank</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Secure assessment items available to authorised examiners.</p>
      </div>
      <div className="divide-y divide-[#eef1f4]">
        {bank.map(([code, title, subject, status]) => (
          <article key={code} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[#2f3338]">{title}</h2>
              <p className="text-sm text-[#6b7380]">{code} · {subject}</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-[#9aa3ad]">{status}</span>
          </article>
        ))}
      </div>
    </ConsoleShell>
  );
}
