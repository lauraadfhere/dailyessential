'use client';

import { useMemo, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { gradebookColumns, gradebookRows } from '../../../lib/atlas-data';

type Row = { id: string; student: string; scores: Record<string, number | null> };

function weightedTotal(scores: Record<string, number | null>) {
  let total = 0;
  let weight = 0;
  for (const column of gradebookColumns) {
    const score = scores[column.id];
    if (score === null || score === undefined) continue;
    total += (score / column.max) * column.weight;
    weight += column.weight;
  }
  return weight ? Math.round((total / weight) * 1000) / 10 : 0;
}

function letter(percent: number) {
  if (percent >= 80) return 'A';
  if (percent >= 70) return 'B';
  if (percent >= 60) return 'C';
  if (percent >= 50) return 'D';
  if (percent >= 40) return 'E';
  return 'F';
}

export default function TeacherGradebookPage() {
  const [rows, setRows] = useState<Row[]>(gradebookRows);
  const [published, setPublished] = useState(false);

  const totals = useMemo(() => rows.map(row => ({ ...row, total: weightedTotal(row.scores) })), [rows]);
  const classAverage = Math.round((totals.reduce((sum, row) => sum + row.total, 0) / Math.max(totals.length, 1)) * 10) / 10;
  const failing = totals.filter(row => row.total < 50).length;

  const update = (id: string, columnId: string, value: string, max: number) => {
    setPublished(false);
    setRows(current => current.map(row => {
      if (row.id !== id) return row;
      const parsed = value === '' ? null : Math.max(0, Math.min(max, Number(value)));
      return { ...row, scores: { ...row.scores, [columnId]: parsed === null || Number.isNaN(parsed) ? null : parsed } };
    }));
  };

  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Assessment · UI / UX Design Studio · SS2 Design"
        title="Gradebook"
        description="Enter scores, see weighted totals immediately, then submit for moderation. Learners only see marks after publication."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Import CSV</button>
            <button type="button" onClick={() => setPublished(true)} className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Publish marks</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Class average', value: `${classAverage}%`, detail: `Grade ${letter(classAverage)}` },
            { label: 'Learners', value: String(rows.length), detail: 'Four marked, two with gaps' },
            { label: 'Below 50%', value: String(failing), detail: 'Intervention flag automatic', tone: failing ? 'danger' : undefined },
            { label: 'Publication', value: published ? 'Published' : 'Draft', detail: published ? 'Visible to learners and guardians' : 'Only visible to you', tone: published ? 'success' : 'warn' },
          ]}
        />

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f4] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">Term 1 marks</h2>
              <p className="mt-1 text-[13px] text-[#6b7380]">Weights: Homework 20% · Quiz 15% · Project 25% · Exam 40%</p>
            </div>
            <Badge tone={published ? 'success' : 'warn'}>{published ? 'published' : 'draft'}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr>
                  <Th>Learner</Th>
                  {gradebookColumns.map(column => <Th key={column.id}>{column.title}<span className="block font-normal normal-case tracking-normal text-[#c0c6ce]">max {column.max}</span></Th>)}
                  <Th>Weighted</Th>
                  <Th>Grade</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {rows.map(row => {
                  const total = weightedTotal(row.scores);
                  return (
                    <tr key={row.id}>
                      <Td className="font-medium text-[#2f3338]">{row.student}</Td>
                      {gradebookColumns.map(column => (
                        <Td key={column.id}>
                          <input
                            type="number"
                            min={0}
                            max={column.max}
                            value={row.scores[column.id] ?? ''}
                            onChange={event => update(row.id, column.id, event.target.value, column.max)}
                            aria-label={`${row.student} ${column.title}`}
                            className="h-8 w-16 rounded border border-[#d8dde4] px-2 text-[13px] outline-none focus:border-[#2e9fff]"
                          />
                        </Td>
                      ))}
                      <Td className="font-semibold text-[#2f3338]">{total}%</Td>
                      <Td><Badge tone={statusTone(letter(total))}>{letter(total)}</Badge></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Assessment statistics" description="Across the current gradebook.">
            <ul className="divide-y divide-[#eef1f4] text-[13px]">
              {[
                ['Highest', `${Math.max(...totals.map(row => row.total))}%`],
                ['Lowest', `${Math.min(...totals.map(row => row.total))}%`],
                ['Median', `${[...totals.map(row => row.total)].sort((a, b) => a - b)[Math.floor(totals.length / 2)]}%`],
                ['Missing marks', String(rows.reduce((count, row) => count + gradebookColumns.filter(column => row.scores[column.id] === null).length, 0))],
              ].map(([label, value]) => (
                <li key={label} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-[#6b7380]">{label}</span>
                  <span className="font-semibold text-[#2f3338]">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Before you publish">
            <ul className="space-y-2.5 text-[13px] leading-6 text-[#4a515a]">
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Confirm missing marks are intentional (absent, exempt or not submitted).</li>
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Attach feedback comments for any learner below 50%.</li>
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Submit for HoD moderation if this is a common assessment.</li>
            </ul>
            <div className="mt-4">
              <Callout tone="info" title="Every cell keeps its history.">
                Changes record the author, time and previous value, so a grade query can be answered with evidence.
              </Callout>
            </div>
          </Panel>
        </div>
      </PageFrame>
    </ConsoleShell>
  );
}
