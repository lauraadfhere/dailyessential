import ConsoleShell from '../../../components/console-shell';
import { progressTracks } from '../../../lib/teacher-data';

const riskStyle = {
  'on-track': 'bg-emerald-50 text-emerald-700',
  watch: 'bg-amber-50 text-amber-700',
  'at-risk': 'bg-red-50 text-red-700',
} as const;

export default function TeacherTrackingPage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#2f3338]">Progress tracking</h2>
        <p className="mt-1 text-sm text-[#6b7380]">Monitor completion, recent activity and learners who need attention.</p>
      </div>

      <div className="space-y-4 px-5 py-5">
        {progressTracks.map(item => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{item.learner}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.course} · Last activity: {item.lastActivity}</p>
              </div>
              <span className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase ${riskStyle[item.risk]}`}>{item.risk}</span>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                <span>Completion</span>
                <span>{item.completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#1738a8]" style={{ width: `${item.completion}%` }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </ConsoleShell>
  );
}
