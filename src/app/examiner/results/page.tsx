import ConsoleShell from '../../../components/console-shell';
import { gradingPapers } from '../../../lib/examiner-data';

export default function ExaminerResultsPage() {
  const approved = gradingPapers.filter(item => item.status === 'approved');
  return (
    <ConsoleShell role="examiner" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Results review</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Verify scored papers before official release.</p>
      </div>
      <div className="divide-y divide-[#eef1f4]">
        {approved.map(item => (
          <article key={item.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[#2f3338]">{item.candidate}</h2>
              <p className="text-sm text-[#6b7380]">{item.paper} · {item.subject}</p>
            </div>
            <p className="text-sm font-bold text-[#2e9fff]">{item.score}/{item.max}</p>
          </article>
        ))}
      </div>
    </ConsoleShell>
  );
}
