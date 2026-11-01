import ConsoleShell from '../../../components/console-shell';

export default function ExaminerReportsPage() {
  return (
    <ConsoleShell role="examiner" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Exam reports</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Operational summaries for assessment cycles.</p>
      </div>
      <ul className="space-y-3 px-5 py-6 text-sm text-[#4a515a]">
        <li className="rounded border border-[#e1e5eb] bg-white px-4 py-3">October marking progress — 64% complete</li>
        <li className="rounded border border-[#e1e5eb] bg-white px-4 py-3">Subject variance report — Digital Literacy</li>
        <li className="rounded border border-[#e1e5eb] bg-white px-4 py-3">Release readiness checklist — pending QC sign-off</li>
      </ul>
    </ConsoleShell>
  );
}
