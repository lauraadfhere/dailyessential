'use client';

import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { SearchField, SelectField } from '../../../components/platform/filter-tabs';
import { Badge, Callout, EmptyNote, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { auditEntries } from '../../../lib/atlas-data';

export default function AdminAuditPage() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('all');

  const actions = Array.from(new Set(auditEntries.map(entry => entry.action)));
  const visible = auditEntries.filter(entry => {
    const actionMatch = action === 'all' || entry.action === action;
    const text = `${entry.actor} ${entry.entity} ${entry.detail} ${entry.id}`.toLowerCase();
    return actionMatch && text.includes(query.trim().toLowerCase());
  });

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Governance"
        title="Audit log"
        description="Immutable history of who changed what, when and from where — including before and after values for marks, money, attendance and personal data."
        actions={<button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Export log</button>}
      >
        <StatGrid
          items={[
            { label: 'Events today', value: '37', detail: 'Across 12 staff accounts' },
            { label: 'Grade changes', value: '4', detail: 'All published after moderation' },
            { label: 'Permission changes', value: '1', detail: 'Temporary substitute grant' },
            { label: 'Failed logins', value: '2', detail: 'Rate limiting applied', tone: 'warn' },
          ]}
        />

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">Activity</h2>
              <p className="mt-1 text-[13px] text-[#6b7380]">Newest first. Logs cannot be edited or deleted.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchField value={query} onChange={setQuery} placeholder="Search actor, entity or ID…" />
              <SelectField
                label="Action"
                value={action}
                onChange={setAction}
                options={[{ value: 'all', label: 'All actions' }, ...actions.map(item => ({ value: item, label: item }))]}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Entity</Th><Th>Detail</Th><Th>Source IP</Th></tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {visible.map(entry => (
                  <tr key={entry.id} className="hover:bg-[#fbfcfd]">
                    <Td className="whitespace-nowrap">
                      <p className="font-medium text-[#2f3338]">{entry.at}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-[#9aa3ad]">{entry.id}</p>
                    </Td>
                    <Td>
                      <p>{entry.actor}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{entry.role}</p>
                    </Td>
                    <Td><Badge tone={statusTone(entry.action)}>{entry.action}</Badge></Td>
                    <Td className="font-medium text-[#2f3338]">{entry.entity}</Td>
                    <Td>{entry.detail}</Td>
                    <Td className="font-mono text-[11px] text-[#6b7380]">{entry.ip}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && <EmptyNote>No audit entries match this filter.</EmptyNote>}
        </Panel>

        <Callout tone="info" title="Audit coverage is mandatory, not optional.">
          Logins, role changes, mark publication, attendance corrections, fee adjustments, record changes, exports and impersonation sessions are always recorded.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
