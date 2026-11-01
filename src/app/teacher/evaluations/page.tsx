import ConsoleShell from '../../../components/console-shell';
import { evaluationTracks } from '../../../lib/teacher-data';

const stageLabel: Record<string, string> = {
  requested: 'Requested',
  'in-review': 'In review',
  scored: 'Scored',
  shared: 'Shared with family',
};

export default function TeacherEvaluationsPage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#2f3338]">Evaluation tracking</h2>
        <p className="mt-1 text-sm text-[#6b7380]">Follow placement and transfer evaluations from request through shared results.</p>
      </div>

      <div className="grid gap-4 px-5 pt-5 md:grid-cols-4">
        {(['requested', 'in-review', 'scored', 'shared'] as const).map(stage => (
          <article key={stage} className="border-l-4 border-[#ffbb2c] bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#1738a8]">{evaluationTracks.filter(item => item.stage === stage).length}</p>
            <p className="mt-1 text-sm text-slate-600">{stageLabel[stage]}</p>
          </article>
        ))}
      </div>

      <div className="space-y-3 px-5 py-5">
        {evaluationTracks.map(item => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{item.learner}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.subject} · Updated {item.updatedAt}</p>
                <p className="mt-2 text-sm text-slate-500">{item.notes}</p>
              </div>
              <span className="rounded bg-[#e8effd] px-3 py-1 text-xs font-bold text-[#1738a8]">{stageLabel[item.stage]}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="rounded border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Open request</button>
              <button type="button" className="rounded bg-[#1738a8] px-3 py-1.5 text-xs font-bold text-white">Advance stage</button>
            </div>
          </article>
        ))}
      </div>
    </ConsoleShell>
  );
}
