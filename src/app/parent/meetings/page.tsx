'use client';

import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { parentMeetingSlots } from '../../../lib/atlas-data';

type Slot = (typeof parentMeetingSlots)[number];

export default function ParentMeetingsPage() {
  const [slots, setSlots] = useState<Slot[]>(parentMeetingSlots);
  const [booked, setBooked] = useState<string | null>(null);

  const book = (slot: Slot) => {
    setSlots(current => current.map(item => item.id === slot.id ? { ...item, status: 'requested', parent: 'Hassan Ahmed', student: 'Amina Ahmed' } : item));
    setBooked(slot.time);
  };

  return (
    <PortalShell role="parent">
      <PageFrame
        variant="portal"
        eyebrow="Family portal"
        title="Parent meetings"
        description="Book a slot with your child’s teacher. Confirmations and video links arrive by email and in this page."
        actions={<button type="button" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Add to calendar</button>}
      >
        <StatGrid
          items={[
            { label: 'Next conference', value: '4 Nov', detail: '14:00 – 16:00 · Main Hall' },
            { label: 'Your booking', value: booked || 'None yet', detail: booked ? 'Request sent to the teacher' : 'Choose a slot below', tone: booked ? 'success' : 'warn' },
            { label: 'Format', value: 'In person / video', detail: 'Choose when you book' },
            { label: 'Meeting length', value: '18 min', detail: 'Follow-up notes shared after' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Available slots" description="Tuesday 4 November · parents’ evening." className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Time</Th><Th>Teacher</Th><Th>Mode</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {slots.map(slot => (
                    <tr key={slot.id}>
                      <Td className="font-semibold text-[#15133d]">{slot.time}</Td>
                      <Td>Mrs. Adebayo · Design</Td>
                      <Td>{slot.mode}</Td>
                      <Td><Badge tone={statusTone(slot.status)}>{slot.status}</Badge></Td>
                      <Td className="text-right">
                        {slot.status === 'available' || slot.status === 'requested' ? (
                          <button type="button" onClick={() => book(slot)} disabled={slot.status === 'requested'} className="rounded bg-[#1738a8] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#102d88] disabled:opacity-40">
                            {slot.status === 'requested' ? 'Requested' : 'Book slot'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Booked</span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Before the meeting" description="Come prepared and keep it focused.">
              <ul className="space-y-2.5 text-[13px] leading-6 text-slate-600">
                <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Review the latest marks and teacher comments in Academics.</li>
                <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Note one question about progress and one about wellbeing.</li>
                <li className="flex gap-2"><span className="text-[#1738a8]">•</span>Agree one action at home before you leave.</li>
              </ul>
            </Panel>
            <Panel title="Request another time" description="Cannot make the published slots?">
              <p className="text-[13px] leading-6 text-slate-600">Ask the class tutor for an alternative slot. Meetings can be held by phone or video if you cannot come to campus.</p>
              <button type="button" className="mt-3 rounded border border-[#1738a8] px-3 py-2 text-[12px] font-bold text-[#1738a8] hover:bg-[#e8eefc]">Request alternative</button>
            </Panel>
          </div>
        </div>

        <Callout tone="brand" title="Interpreters and accessibility.">
          Tell the school in advance if you need an interpreter, a larger-print handout or step-free access. These are arranged at no cost to families.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
