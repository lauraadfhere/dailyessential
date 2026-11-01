import ConsoleShell from '../../../components/console-shell';

export default function ExaminerQualityPage() {
  return (
    <ConsoleShell role="examiner" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Quality control</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Sample reviews and consistency checks across markers.</p>
      </div>
      <div className="grid gap-4 px-5 py-6 sm:grid-cols-3">
        {[['12', 'Scripts sampled'], ['2', 'Variance flags'], ['98%', 'Agreement rate']].map(([value, label]) => (
          <article key={label} className="rounded border border-[#e1e5eb] bg-white p-5">
            <p className="text-3xl font-semibold text-[#2e9fff]">{value}</p>
            <p className="mt-2 text-sm text-[#6b7380]">{label}</p>
          </article>
        ))}
      </div>
    </ConsoleShell>
  );
}
