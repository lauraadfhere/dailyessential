'use client';

import Link from 'next/link';
import { useState } from 'react';
import PortalShell from '../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../components/platform/kit';
import { currency, parentAnnouncements, parentChildren, parentForms, todaySchedule } from '../../lib/atlas-data';

export default function ParentOverviewPage() {
  const [childId, setChildId] = useState(parentChildren[0].id);
  const child = parentChildren.find(item => item.id === childId) || parentChildren[0];
  const pendingForms = parentForms.filter(form => form.status === 'pending').length;

  return (
    <PortalShell role="parent">
      <PageFrame
        variant="portal"
        eyebrow="Family portal"
        title="Family overview"
        description="Everything for your children in one place: today at school, progress, fees and anything that needs your signature."
        actions={<Link href="/parent/fees" className="rounded bg-[#1738a8] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#102d88]">Pay fees</Link>}
      >
        <div className="flex flex-wrap gap-2">
          {parentChildren.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setChildId(item.id)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${item.id === childId ? 'border-[#1738a8] bg-[#1738a8] text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-[#1738a8] hover:text-[#1738a8]'}`}
            >
              {item.name} · {item.className}
            </button>
          ))}
        </div>

        <StatGrid
          items={[
            { label: 'Attendance', value: `${child.attendance}%`, detail: `${child.className} · ${child.campus}`, tone: child.attendance < 85 ? 'warn' : 'success' },
            { label: 'Average', value: String(child.average), detail: 'Term 1 published results' },
            { label: 'Fee balance', value: child.balance ? currency(child.balance) : 'Clear', detail: child.balance ? 'Instalment plan available' : 'No outstanding balance', tone: child.balance ? 'danger' : 'success' },
            { label: 'Action items', value: String(pendingForms), detail: 'Forms awaiting your signature', tone: pendingForms ? 'warn' : undefined },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Panel title={`${child.name} today`} description={`${child.className} · ${child.campus}`}>
            <ul className="space-y-2.5">
              {todaySchedule.map(item => (
                <li key={`${item.time}-${item.subject}`} className="flex items-center gap-3 rounded border border-slate-200 px-3 py-2.5">
                  <span className="w-12 shrink-0 text-[11px] font-bold text-slate-400">{item.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#15133d]">{item.subject}</p>
                    <p className="text-[11px] text-slate-500">{item.teacher} · {item.room}</p>
                  </div>
                  {item.state === 'now' ? <Badge tone="brand">in class</Badge> : item.state === 'next' ? <Badge tone="info">next</Badge> : <Badge tone="neutral">done</Badge>}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/parent/academics" className="rounded border border-[#1738a8] px-3 py-2 text-[12px] font-bold text-[#1738a8] hover:bg-[#e8eefc]">View progress</Link>
              <Link href="/parent/meetings" className="rounded border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50">Book a meeting</Link>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Needs your attention" description="Two minutes now saves a phone call later.">
              <ul className="divide-y divide-slate-100">
                {parentForms.filter(form => form.status === 'pending').map(form => (
                  <li key={form.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[13px] font-semibold text-[#15133d]">{form.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Due {form.due}</p>
                    </div>
                    <Link href="/parent/forms" className="shrink-0 text-[12px] font-bold text-[#1738a8] hover:underline">Sign →</Link>
                  </li>
                ))}
                {!pendingForms && <li className="py-3 text-[13px] text-slate-500">Nothing needs your signature. Well done.</li>}
              </ul>
            </Panel>
            <Panel title="Fees" description={child.balance ? 'Balance outstanding on the current invoice.' : 'All settled for this term.'}>
              <p className="text-2xl font-bold text-[#15133d]">{child.balance ? currency(child.balance) : '₦0'}</p>
              <p className="mt-1 text-[12px] text-slate-500">{child.balance ? 'Pay in full or split into two instalments.' : 'Receipts are available in the fees page.'}</p>
              <Link href="/parent/fees" className="mt-3 inline-block text-[12px] font-bold text-[#1738a8] hover:underline">Open fees & receipts →</Link>
            </Panel>
          </div>
        </div>

        <Panel title="School announcements" description="Messages from the school office.">
          <ul id="announcements" className="divide-y divide-slate-100">
            {parentAnnouncements.map(item => (
              <li key={item.title} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[#15133d]">{item.title}</p>
                  <span className="text-[11px] text-slate-400">{item.when}</span>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-slate-600">{item.body}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Recent results" description="Published marks only." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Course</Th><Th>Result</Th><Th>Trend</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {[['UI / UX Design Studio', 'B', 'up'], ['Digital Literacy', 'B', 'steady'], ['Mathematics', 'C', 'watch']].map(([course, grade, trend]) => (
                  <tr key={course}>
                    <Td className="font-semibold text-[#15133d]">{course}</Td>
                    <Td className="font-bold text-[#1738a8]">{grade}</Td>
                    <Td><Badge tone={statusTone(trend === 'watch' ? 'watch' : trend === 'up' ? 'improving' : 'steady')}>{trend}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Quick links">
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              {[
                ['Academics', '/parent/academics'],
                ['Fees & receipts', '/parent/fees'],
                ['Forms & consent', '/parent/forms'],
                ['Parent meetings', '/parent/meetings'],
                ['School news', '/news'],
                ['Library', '/library'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded border border-slate-200 px-3 py-2.5 font-semibold text-slate-700 transition hover:border-[#1738a8] hover:text-[#1738a8]">{label}</Link>
              ))}
            </div>
          </Panel>
        </div>

        <Callout tone="brand" title="One login, every child.">
          You can switch between children at any time. Access is limited to the children linked to your account, and separated-family rules are respected.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
