'use client';

import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { markbook, type MarkRow } from '../../../lib/teacher-data';

export default function TeacherMarksPage() {
  const [rows, setRows] = useState<MarkRow[]>(markbook);

  const updateScore = (id: string, value: string) => {
    setRows(current => current.map(row => {
      if (row.id !== id) return row;
      const score = value === '' ? null : Math.min(row.max, Math.max(0, Number(value)));
      return { ...row, score: Number.isFinite(score as number) || score === null ? score : row.score, status: score === null ? 'draft' : 'submitted' };
    }));
  };

  const publish = (id: string) => {
    setRows(current => current.map(row => (row.id === id && row.score !== null ? { ...row, status: 'published' } : row)));
  };

  return (
    <ConsoleShell role="teacher" showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#2f3338]">Assign marks</h2>
        <p className="mt-1 text-sm text-[#6b7380]">Enter scores, submit for review, then publish results to learners.</p>
      </div>

      <div className="overflow-hidden bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Assessment</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(row => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{row.learner}</td>
                <td className="px-4 py-3 text-slate-600">{row.className}</td>
                <td className="px-4 py-3 text-slate-600">{row.assessment}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={row.max}
                      value={row.score ?? ''}
                      onChange={event => updateScore(row.id, event.target.value)}
                      className="h-8 w-16 rounded border border-slate-300 px-2 outline-none focus:border-[#1738a8]"
                    />
                    <span className="text-slate-500">/ {row.max}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${row.status === 'published' ? 'bg-emerald-50 text-emerald-700' : row.status === 'submitted' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={row.score === null || row.status === 'published'}
                    onClick={() => publish(row.id)}
                    className="rounded bg-[#1738a8] px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Publish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ConsoleShell>
  );
}
