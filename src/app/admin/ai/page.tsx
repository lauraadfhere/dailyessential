'use client';

import { useCallback, useEffect, useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, EmptyNote, PageFrame, Panel, StatGrid, tableHead, Td, Th } from '../../../components/platform/kit';
import { readPortalIdentity } from '../../../lib/portal-session';

type Application = {
  id: string;
  reference: string;
  childName: string;
  grade: string;
  status: string;
  docsComplete: boolean;
  documents: { type: string; url: string }[];
  createdAt?: string;
};

type Summary = {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
  reasons: string[];
  confidence: number;
  note: string;
  humanDecisionRequired: boolean;
};

const statusLabel: Record<string, string> = {
  SUBMITTED: 'submitted',
  DOCS_REVIEW: 'docs review',
  TEST_PENDING: 'test pending',
  SHORTLISTED: 'shortlisted',
  OFFERED: 'offered',
  ENROLLED: 'enrolled',
};

export default function AdminAiPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [testScore, setTestScore] = useState(65);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admissions?all=1', {
      headers: { 'x-parse-session-token': sessionStorage.getItem('bifti.session') || '' },
    })
      .then(response => response.json())
      .then(data => {
        setApplications(data.applications || []);
        setConfigured(data.configured !== false);
      })
      .catch(() => setError('Applications could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const screen = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    setSummary(null);
    try {
      const identity = readPortalIdentity();
      const response = await fetch('/api/ai/admission-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identity.email || 'admin@bifti.school',
          role: identity.role || 'admin',
          grade: selected.grade,
          testScore,
          interviewNotes: notes,
          documentsComplete: selected.docsComplete,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Screening failed.');
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Screening failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Admissions intelligence"
        title="AI screening"
        description="A fair, anonymised summary of each completed application. AI recommends; the admissions officer decides and records the outcome."
      >
        <StatGrid
          items={[
            { label: 'Applications on file', value: String(applications.length), detail: 'From the public admissions form' },
            { label: 'Documents complete', value: String(applications.filter(row => row.docsComplete).length), detail: 'Ready for screening' },
            { label: 'Awaiting review', value: String(applications.filter(row => row.status === 'DOCS_REVIEW').length), detail: 'Documents review stage' },
            { label: 'AI role', value: 'Advisory', detail: 'No decision is automated' },
          ]}
        />

        {!configured && <Callout tone="warn" title="The school database is not configured.">Applications shown here come from the public form once Parse is connected.</Callout>}
        {error && <p className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700">{error}</p>}

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Applications" description="Select an applicant to build a screening summary." className="overflow-hidden" bodyClassName="p-0">
            {loading ? (
              <p className="px-5 py-6 text-[13px] text-[#6b7380]">Loading applications…</p>
            ) : applications.length === 0 ? (
              <EmptyNote>No applications yet. Submit one from the public admissions page to test the flow.</EmptyNote>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className={tableHead}>
                    <tr><Th>Applicant</Th><Th>Grade</Th><Th>Documents</Th><Th>Status</Th><Th className="text-right">Screen</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f4]">
                    {applications.map(row => (
                      <tr key={row.id} className={selected?.id === row.id ? 'bg-[#f3f9ff]' : ''}>
                        <Td>
                          <p className="font-semibold text-[#2f3338]">{row.childName}</p>
                          <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{row.reference}</p>
                        </Td>
                        <Td>{row.grade}</Td>
                        <Td>{row.documents.length} file{row.documents.length === 1 ? '' : 's'}</Td>
                        <Td><Badge tone={row.docsComplete ? 'success' : 'warn'}>{statusLabel[row.status] || row.status.toLowerCase()}</Badge></Td>
                        <Td className="text-right">
                          <button
                            type="button"
                            onClick={() => { setSelected(row); setSummary(null); setNotes(''); }}
                            className="rounded border border-[#2e9fff]/50 px-2.5 py-1.5 text-[11px] font-bold text-[#2e9fff] hover:bg-[#f3f9ff]"
                          >
                            Select
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Screening summary" description={selected ? `${selected.childName} · ${selected.grade}` : 'Choose an applicant first.'}>
            {!selected ? (
              <p className="text-[13px] text-[#6b7380]">Pick an application from the list to prepare an anonymised summary.</p>
            ) : (
              <div className="space-y-4">
                <label className="block text-[12px] font-semibold text-[#4a515a]">Entrance test score (%)
                  <input type="number" min={0} max={100} value={testScore} onChange={event => setTestScore(Number(event.target.value))} className="mt-1 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px]" />
                </label>
                <label className="block text-[12px] font-semibold text-[#4a515a]">Interview notes
                  <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={4} placeholder="What did the interview show? Strengths, support needs, questions…" className="mt-1 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px]" />
                </label>
                <button type="button" onClick={screen} disabled={busy} className="rounded bg-[#2e9fff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef] disabled:cursor-wait disabled:opacity-60">
                  {busy ? 'Screening…' : 'Generate AI summary'}
                </button>

                {summary && (
                  <div className="space-y-3 border-t border-[#eef1f4] pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={summary.recommendation === 'admit' ? 'success' : summary.recommendation === 'decline' ? 'danger' : 'warn'}>{summary.recommendation}</Badge>
                      <span className="text-[11px] font-semibold text-[#6b7380]">confidence {Math.round(summary.confidence * 100)}%</span>
                    </div>
                    <p className="text-[13px] leading-6 text-[#4a515a]">{summary.summary}</p>
                    {summary.strengths.length > 0 && (
                      <div><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Strengths</p>
                        <ul className="mt-1 list-disc pl-4 text-[12px] leading-5 text-[#4a515a]">{summary.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul>
                      </div>
                    )}
                    {summary.risks.length > 0 && (
                      <div><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Watch points</p>
                        <ul className="mt-1 list-disc pl-4 text-[12px] leading-5 text-[#4a515a]">{summary.risks.map((item, index) => <li key={index}>{item}</li>)}</ul>
                      </div>
                    )}
                    {summary.reasons.length > 0 && (
                      <div><p className="text-[10px] font-bold uppercase tracking-wide text-[#9aa3ad]">Reasons</p>
                        <ul className="mt-1 list-disc pl-4 text-[12px] leading-5 text-[#4a515a]">{summary.reasons.map((item, index) => <li key={index}>{item}</li>)}</ul>
                      </div>
                    )}
                    <p className="rounded bg-[#f7f9fb] px-3 py-2 text-[11px] leading-5 text-[#6b7380]">{summary.note}</p>
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>

        <Callout tone="warn" title="Fairness guardrails are on.">
          Names, gender, religion, tribe and family details are never sent to the model. Every recommendation shows its reasons and requires a human decision that is written to the audit log.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
