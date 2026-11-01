'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import FilterTabs, { SearchField } from '../../../components/platform/filter-tabs';
import { Badge, BarList, Callout, EmptyNote, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { admissionsFunnel, sectionCatalog } from '../../../lib/atlas-data';

type Row = {
  id: string;
  reference: string;
  childName: string;
  grade: string;
  guardianName: string;
  guardianEmail: string;
  status: string;
  docsComplete: boolean;
  documents: { type: string }[];
  createdAt?: string;
};

const tabDefs = [
  { id: 'all', label: 'All' },
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'DOCS_REVIEW', label: 'Documents' },
  { id: 'MORE_INFO', label: 'More info' },
  { id: 'TEST_PENDING', label: 'Test' },
  { id: 'SHORTLISTED', label: 'Shortlisted' },
  { id: 'WAITLISTED', label: 'Waitlist' },
  { id: 'OFFERED', label: 'Offered' },
  { id: 'ENROLLED', label: 'Enrolled' },
  { id: 'REJECTED', label: 'Rejected' },
];

const actions = [
  { status: 'DOCS_REVIEW', label: 'Review docs' },
  { status: 'MORE_INFO', label: 'Request info' },
  { status: 'SHORTLISTED', label: 'Shortlist' },
  { status: 'WAITLISTED', label: 'Waitlist' },
  { status: 'OFFERED', label: 'Offer' },
  { status: 'ENROLLED', label: 'Enrol' },
  { status: 'REJECTED', label: 'Reject' },
];

export default function AdminAdmissionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admissions?all=1', {
      headers: { 'x-parse-session-token': sessionStorage.getItem('bifti.session') || '' },
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setRows(data.applications || []);
      })
      .catch(() => setError('Applications could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tabs = useMemo(() => tabDefs.map(item => ({
    ...item,
    count: item.id === 'all' ? rows.length : rows.filter(row => row.status === item.id).length,
  })), [rows]);

  const visible = rows.filter(row => {
    const statusMatch = tab === 'all' || row.status === tab;
    const text = `${row.childName} ${row.guardianName} ${row.guardianEmail} ${row.grade} ${row.reference}`.toLowerCase();
    return statusMatch && text.includes(query.trim().toLowerCase());
  });

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    setError('');
    try {
      const response = await fetch('/api/admissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-parse-session-token': sessionStorage.getItem('bifti.session') || '',
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update the application.');
      setRows(current => current.map(row => (row.id === id ? { ...row, status: data.status } : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the application.');
    } finally {
      setBusyId('');
    }
  };

  const openOffers = rows.filter(row => row.status === 'OFFERED').length;
  const enrolled = rows.filter(row => row.status === 'ENROLLED').length;

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Admissions & enrolment"
        title="Admissions"
        description="Track every family from inquiry to enrolment. Decisions, capacity and offers stay in one auditable pipeline."
        actions={
          <>
            <Link href="/admissions" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Public page</Link>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">New application</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Applications this term', value: String(rows.length), detail: `${rows.filter(row => row.status === 'SUBMITTED').length} awaiting first review` },
            { label: 'Open offers', value: String(openOffers), detail: 'One offer expires 8 Nov', tone: openOffers ? 'warn' : undefined },
            { label: 'Enrolled', value: String(enrolled), detail: 'Deposit received and section assigned' },
            { label: 'Capacity used', value: '120 / 144', detail: '24 places remaining across five sections' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <Panel title="Admissions funnel" description="Current term, all programmes.">
            <BarList items={admissionsFunnel.map(stage => ({ label: stage.label, value: stage.value, display: String(stage.value) }))} />
          </Panel>
          <Panel title="Capacity by section" description="Seats are checked before an offer is released.">
            <ul className="space-y-4">
              {sectionCatalog.map(section => {
                const used = Math.round((section.learners / section.capacity) * 100);
                return (
                  <li key={section.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                      <span className="font-medium text-[#2f3338]">{section.name}</span>
                      <span className="text-[#6b7380]">{section.learners} / {section.capacity}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#eef1f4]">
                      <span className={`block h-full rounded-full ${used > 92 ? 'bg-amber-500' : 'bg-[#2e9fff]'}`} style={{ width: `${used}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <div className="flex flex-col gap-3 px-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">Applications</h2>
              <p className="mt-1 text-[13px] text-[#6b7380]">Assign reviewers, request documents and release decisions.</p>
            </div>
            <SearchField value={query} onChange={setQuery} placeholder="Search child, guardian or ID…" />
          </div>
          <FilterTabs tabs={tabs} value={tab} onChange={setTab} className="mt-3 px-2" />
          {error && <p className="px-5 pb-3 text-[13px] text-red-600">{error}</p>}
          {loading && <EmptyNote>Loading applications…</EmptyNote>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr>
                  <Th>Applicant</Th>
                  <Th>Grade</Th>
                  <Th>Guardian</Th>
                  <Th>Submitted</Th>
                  <Th>Documents</Th>
                  <Th>Score</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {visible.map(row => (
                  <tr key={row.id} className="hover:bg-[#fbfcfd]">
                    <Td>
                      <p className="font-semibold text-[#2f3338]">{row.childName}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{row.reference}</p>
                    </Td>
                    <Td>{row.grade}</Td>
                    <Td>
                      <p>{row.guardianName}</p>
                      <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{row.guardianEmail}</p>
                    </Td>
                    <Td className="whitespace-nowrap">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</Td>
                    <Td className="whitespace-nowrap">{row.docsComplete ? 'Complete' : `${row.documents.length} uploaded`}</Td>
                    <Td>—</Td>
                    <Td><Badge tone={statusTone(row.status)}>{row.status.replace(/_/g, ' ').toLowerCase()}</Badge></Td>
                    <Td className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {actions.filter(action => action.status !== row.status).map(action => (
                          <button
                            key={action.status}
                            type="button"
                            disabled={busyId === row.id || row.status === 'ENROLLED'}
                            onClick={() => setStatus(row.id, action.status)}
                            className="rounded border border-[#2e9fff]/50 px-2 py-1 text-[11px] font-bold text-[#2e9fff] hover:bg-[#f3f9ff] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && <EmptyNote>No applications match this view.</EmptyNote>}
        </Panel>

        <Callout tone="warn" title="Offer decisions require a human approval.">
          Scores, sibling priority and capacity are advisory. The Registrar confirms every offer and the decision is written to the audit log.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
