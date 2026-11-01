'use client';

import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { parentForms } from '../../../lib/atlas-data';

export default function ParentFormsPage() {
  const [forms, setForms] = useState(parentForms);
  const [selected, setSelected] = useState(parentForms[0].id);
  const [signature, setSignature] = useState('');
  const [agreed, setAgreed] = useState(false);

  const pending = forms.filter(form => form.status === 'pending');
  const active = forms.find(form => form.id === selected) || forms[0];

  const sign = () => {
    if (!signature.trim() || !agreed) return;
    setForms(current => current.map(form => form.id === selected ? { ...form, status: 'signed', due: `Signed ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` } : form));
    setSignature('');
    setAgreed(false);
  };

  return (
    <PortalShell role="parent">
      <PageFrame
        variant="portal"
        eyebrow="Family portal"
        title="Forms & consent"
        description="Permission slips, consent renewals and acknowledgements. Signing here is recorded with a timestamp and an audit trail."
        actions={<span className="rounded border border-slate-300 px-3 py-2 text-[12px] font-semibold text-slate-500">{pending.length} awaiting you</span>}
      >
        <StatGrid
          items={[
            { label: 'Awaiting signature', value: String(pending.length), detail: 'Closest due 2 November', tone: pending.length ? 'warn' : 'success' },
            { label: 'Completed', value: String(forms.length - pending.length), detail: 'Stored with timestamp' },
            { label: 'Children covered', value: '1', detail: 'Forms are per child' },
            { label: 'Expiring soon', value: '1', detail: 'Media consent renews yearly', tone: 'warn' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Your forms" description="Amina Ahmed · JSS 2 Blue" className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Form</Th><Th>Due</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {forms.map(form => (
                  <tr key={form.id} className={form.id === selected ? 'bg-[#f4f7ff]' : ''}>
                    <Td className="font-semibold text-[#15133d]">{form.title}</Td>
                    <Td className="whitespace-nowrap">{form.due}</Td>
                    <Td><Badge tone={statusTone(form.status)}>{form.status}</Badge></Td>
                    <Td className="text-right">
                      <button type="button" onClick={() => { setSelected(form.id); setSignature(''); setAgreed(false); }} className="text-[12px] font-bold text-[#1738a8] hover:underline">
                        {form.status === 'pending' ? 'Review' : 'View'}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title={active.title} description="Read the detail before signing.">
            <div className="space-y-3 text-[13px] leading-6 text-slate-600">
              <p>The Year 8 robotics trip visits the Innovation Hub on 14 November, leaving school at 08:00 and returning by 16:30.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Supervised by Mr. Okafor and two parent volunteers.</li>
                <li>Transport by school bus; lunch provided.</li>
                <li>Medical and emergency details on file will be shared with trip staff.</li>
              </ul>
            </div>

            {active.status === 'pending' ? (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <label className="block text-[13px]">
                  <span className="font-semibold text-[#15133d]">Type your full name to sign</span>
                  <input value={signature} onChange={event => setSignature(event.target.value)} placeholder="Hassan Ahmed" className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#1738a8]" />
                </label>
                <label className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-600">
                  <input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} className="mt-0.5 h-3.5 w-3.5 accent-[#1738a8]" />
                  I confirm I am the parent or legal guardian and I consent to the activity described above.
                </label>
                <button type="button" disabled={!signature.trim() || !agreed} onClick={sign} className="mt-4 rounded bg-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-40">Sign and submit</button>
              </div>
            ) : (
              <div className="mt-5 rounded border-l-4 border-emerald-500 bg-emerald-50/70 px-4 py-3 text-[13px] text-slate-700">
                <p className="font-semibold text-slate-800">Signed and stored</p>
                <p className="mt-0.5">{active.due}. You can download a copy from your documents.</p>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="What the school can ask you to consent to">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Trips and activities', 'Off-site visits, transport and supervision.'],
              ['Photo and media', 'Use of images in the newsletter and school website.'],
              ['Medical treatment', 'First aid and emergency treatment during school hours.'],
              ['Data sharing', 'Transfer records to a new school or exam board.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded border border-slate-200 p-3.5">
                <p className="text-[13px] font-semibold text-[#15133d]">{title}</p>
                <p className="mt-1 text-[12px] leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Callout tone="brand" title="Consent is recorded, versioned and revocable.">
          You can withdraw non-essential consent at any time. The school keeps the version of the form you actually signed, so there is never ambiguity about what was agreed.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
