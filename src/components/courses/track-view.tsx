'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProgressReport from './progress-report';

type Report = {
  learner: { name: string; email: string };
  generatedAt: string;
  overall: { percent: number; mark: number; label: string; passed: boolean } | null;
  totals: { courses: number; modulesDone: number; modulesTotal: number; minutes: number; gradedTasks: number; waitingTasks: number };
  courses: {
    slug: string; title: string; category: string; completion: number; completedLessons: number; totalLessons: number;
    timeSpentMinutes: number; quizPercent: number | null; taskPercent: number | null; grade: { percent: number; mark: number; label: string; passed: boolean };
  }[];
  todo: { course: string; type: 'lesson' | 'task' | 'quiz' | 'waiting'; title: string; href: string }[];
  weekly: { label: string; completed: number; completedPercent: number; cumulativePercent: number }[];
  activity: { at: string; type: string; title: string; course: string }[];
};

type Insights = {
  ai: boolean;
  summary: string;
  strengths: { title: string; detail: string }[];
  weaknesses: { title: string; detail: string }[];
  suggestions: string[];
};

const hours = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`);
const ago = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(diff / 3_600_000);
  return hrs >= 1 ? `${hrs} h ago` : 'just now';
};

/** Weekly completion bars with the cumulative progress line on top, drawn as SVG so it scales with the screen. */
function WeeklyChart({ data }: { data: Report['weekly'] }) {
  const width = 640;
  const height = 240;
  const pad = { top: 16, right: 16, bottom: 34, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(10, ...data.map(item => item.cumulativePercent), ...data.map(item => item.completedPercent));
  const top = Math.ceil(max / 10) * 10;
  const x = (i: number) => pad.left + (innerW / data.length) * (i + 0.5);
  const y = (value: number) => pad.top + innerH - (value / top) * innerH;
  const barW = Math.min(36, (innerW / data.length) * 0.5);
  const line = data.map((item, i) => `${i ? 'L' : 'M'}${x(i)},${y(item.cumulativePercent)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(fraction => Math.round(top * fraction));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weekly course completion and cumulative progress" className="h-auto w-full">
      {ticks.map(tick => (
        <g key={tick}>
          <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#6b7280">{tick}%</text>
        </g>
      ))}
      {data.map((item, i) => (
        <g key={item.label}>
          <rect x={x(i) - barW / 2} y={y(item.completedPercent)} width={barW} height={Math.max(0, pad.top + innerH - y(item.completedPercent))} fill="#111827" rx="2">
            <title>{`${item.label}: ${item.completed} module${item.completed === 1 ? '' : 's'} finished`}</title>
          </rect>
          <text x={x(i)} y={height - 12} textAnchor="middle" fontSize="11" fill="#6b7280">{item.label}</text>
        </g>
      ))}
      <path d={line} fill="none" stroke="#111827" strokeWidth="1.5" strokeDasharray="4 4" />
      {data.map((item, i) => (
        <circle key={item.label} cx={x(i)} cy={y(item.cumulativePercent)} r="4.5" fill="#fff" stroke="#111827" strokeWidth="1.5">
          <title>{`${item.label}: ${item.cumulativePercent}% of all enrolled modules done`}</title>
        </circle>
      ))}
    </svg>
  );
}

function Ring({ percent, size = 76, label }: { percent: number; size?: number; label: string }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${percent}%`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#111827" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percent / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size / 4.2} fontWeight="700" fill="#111827">{percent}%</text>
    </svg>
  );
}

function Bar({ label, value, tone = 'dark' }: { label: string; value: number | null; tone?: 'dark' | 'mid' }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-500"><span>{label}</span><span className="font-semibold text-slate-800">{value === null ? 'no results yet' : `${value}%`}</span></div>
      <div className="mt-1 h-2 bg-slate-100"><div className={`h-2 ${tone === 'dark' ? 'bg-slate-900' : 'bg-slate-500'}`} style={{ width: `${value ?? 0}%` }} /></div>
    </div>
  );
}

const typeStyle: Record<string, string> = {
  lesson: 'border-slate-900 text-slate-900', task: 'border-slate-900 bg-slate-900 text-white', quiz: 'border-slate-500 text-slate-700', waiting: 'border-slate-300 text-slate-500',
};

export default function TrackView() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState<Date | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightBusy, setInsightBusy] = useState(false);
  const [insightError, setInsightError] = useState('');
  const timer = useRef<number | undefined>(undefined);

  const load = useCallback(() => {
    fetch('/api/progress/report', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load your progress.');
        setReport(data as Report);
        setUpdated(new Date());
        setError('');
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load your progress.'));
  }, []);

  // Live tracking: refresh every 30 s while the tab is visible, and straight away when you come back to it.
  useEffect(() => {
    load();
    const tick = () => { if (document.visibilityState === 'visible') load(); };
    timer.current = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer.current);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [load]);

  const askInsights = async () => {
    setInsightBusy(true);
    setInsightError('');
    try {
      const response = await fetch('/api/ai/insights', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not build suggestions.');
      setInsights(data as Insights);
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : 'Could not build suggestions.');
    } finally {
      setInsightBusy(false);
    }
  };

  const stat = (value: string, label: string) => (
    <div className="border border-slate-200 bg-white p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-300 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Student space / Track</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">My progress tracker</h2>
          <p className="mt-1 text-sm text-slate-500">
            Live view of your courses, marks and what to do next.
            {updated && <span className="ml-1 text-slate-400">Updated {updated.toLocaleTimeString()}.</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={askInsights} disabled={insightBusy} aria-label="Get AI suggestions" title="AI suggestions: strengths, weaknesses and next steps" className="inline-flex h-9 items-center gap-2 border border-slate-900 bg-slate-900 px-3 text-[12px] font-bold text-white hover:bg-black disabled:opacity-60">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>
            {insightBusy ? 'Thinking…' : 'Suggestions'}
          </button>
          <ProgressReport tone="on-light" className="!h-9 !w-9 !border-slate-900 !text-slate-900" />
          <button type="button" onClick={load} aria-label="Refresh" title="Refresh" className="inline-flex h-9 w-9 items-center justify-center border border-slate-900 bg-white text-slate-900 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
          </button>
        </div>
      </section>

      {error && <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
      {!report && !error && <p className="py-10 text-center text-sm text-slate-500">Loading your progress…</p>}

      {(insights || insightError) && (
        <section aria-label="AI suggestions" className="border-2 border-slate-900 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-2.5 text-white">
            <p className="text-sm font-bold">Your coach {insights && !insights.ai && <span className="ml-2 text-[11px] font-normal text-white/70">(based on your marks only)</span>}</p>
            <button type="button" onClick={() => { setInsights(null); setInsightError(''); }} aria-label="Close suggestions" className="px-2 text-lg leading-none hover:opacity-70">×</button>
          </div>
          <div className="p-4 sm:p-5">
            {insightError && <p role="alert" className="text-sm font-semibold text-rose-700">{insightError}</p>}
            {insights && (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-800">{insights.summary}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Strong points</p>
                    {insights.strengths.length ? <ul className="mt-2 space-y-2">{insights.strengths.map((item, i) => <li key={i} className="border-l-4 border-slate-900 bg-slate-50 px-3 py-2 text-[13px]"><b className="text-slate-900">{item.title}</b><br /><span className="text-slate-600">{item.detail}</span></li>)}</ul> : <p className="mt-2 text-[13px] text-slate-500">Nothing stands out yet. Finish quizzes and tasks to reveal your strengths.</p>}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Needs work</p>
                    {insights.weaknesses.length ? <ul className="mt-2 space-y-2">{insights.weaknesses.map((item, i) => <li key={i} className="border-l-4 border-slate-400 bg-slate-50 px-3 py-2 text-[13px]"><b className="text-slate-900">{item.title}</b><br /><span className="text-slate-600">{item.detail}</span></li>)}</ul> : <p className="mt-2 text-[13px] text-slate-500">No weak spots found. Keep it up.</p>}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Suggested next steps</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-slate-800">{insights.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ol>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <div className="col-span-2 flex items-center gap-4 border border-slate-900 bg-slate-900 p-4 text-white lg:col-span-1">
              <p className="text-4xl font-bold leading-none">{report.overall ? <>{report.overall.mark}<span className="text-xl text-white/70">/20</span></> : '—'}</p>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Overall mark</p><p className="text-sm">{report.overall ? `${report.overall.label} · ${report.overall.passed ? 'pass' : 'below 10'}` : 'Not graded yet'}</p></div>
            </div>
            {stat(String(report.totals.courses), 'Courses')}
            {stat(`${report.totals.modulesDone}/${report.totals.modulesTotal}`, 'Modules done')}
            {stat(hours(report.totals.minutes), 'Study time')}
            {stat(`${report.totals.gradedTasks}`, `Tasks graded${report.totals.waitingTasks ? ` · ${report.totals.waitingTasks} waiting` : ''}`)}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <section className="border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">Your journey</h3>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-white" />Cumulative progress</span>
                  <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 bg-slate-900" />Weekly completion</span>
                </div>
              </div>
              <div className="mt-3"><WeeklyChart data={report.weekly} /></div>
            </section>

            <section className="border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900">What to do next</h3>
              {report.todo.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">{report.courses.length ? 'You are up to date.' : 'You are not enrolled in a course yet.'} <Link href="/courses" className="font-bold text-slate-900 underline">Browse courses</Link></p>
              ) : (
                <ul className="mt-3 max-h-[300px] divide-y divide-slate-100 overflow-y-auto border border-slate-200">
                  {report.todo.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 px-3 py-2.5 text-[13px]">
                      <span className={`mt-0.5 shrink-0 border px-1.5 py-0.5 text-[10px] font-bold uppercase ${typeStyle[item.type]}`}>{item.type === 'waiting' ? 'waiting' : item.type}</span>
                      <Link href={item.href} className="min-w-0 flex-1 text-slate-800 hover:underline">{item.title}<span className="block text-[11px] text-slate-400">{item.course}</span></Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section aria-label="Courses" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {report.courses.map(course => (
              <article key={course.slug} className="border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-4">
                  <Ring percent={course.completion} label={`${course.title} completion`} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/courses/${course.slug}/reader/0`} className="block truncate text-sm font-bold text-slate-900 hover:underline">{course.title}</Link>
                    <p className="text-[11px] text-slate-500">{course.category} · {course.completedLessons}/{course.totalLessons} modules · {hours(course.timeSpentMinutes)}</p>
                    <p className="mt-1 inline-block bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">{course.grade.mark}/20 · {course.grade.label}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  <Bar label="Quizzes" value={course.quizPercent} />
                  <Bar label="Teacher-marked tasks" value={course.taskPercent} tone="mid" />
                </div>
              </article>
            ))}
            {!report.courses.length && (
              <p className="border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">Enrol in a course to see it tracked here. <Link href="/courses" className="font-bold text-slate-900 underline">Browse the catalogue</Link></p>
            )}
          </section>

          <section className="border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-base font-bold text-slate-900">Recent activity</h3>
            {report.activity.length === 0 ? <p className="mt-3 text-sm text-slate-500">Nothing yet. Open a module to get started.</p> : (
              <ol className="mt-3 space-y-0">
                {report.activity.map((item, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 pl-1 last:pb-0">
                    <span className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900 before:absolute before:left-1/2 before:top-2.5 before:h-[calc(100%+1rem)] before:w-px before:-translate-x-1/2 before:bg-slate-200 last:before:hidden" aria-hidden="true" />
                    <div className="min-w-0 text-[13px]"><p className="text-slate-800">{item.title}</p><p className="text-[11px] text-slate-400">{item.course} · {ago(item.at)}</p></div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <p className="text-[11px] text-slate-400">Questions about a mark? Open the task in its module and choose “Report this mark”, or <Link href="/student/messages" className="underline">message your teacher</Link>.</p>
        </>
      )}
    </div>
  );
}
