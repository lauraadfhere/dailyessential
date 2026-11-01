'use client';

import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { parentMeetingSlots } from '../../../lib/atlas-data';

type Slot = (typeof parentMeetingSlots)[number];

export default function TeacherMeetingsPage() {
  const [slots, setSlots] = useState<Slot[]>(parentMeetingSlots);

  const setState = (id: string, status: string) => {
    setSlots(current => current.map(slot => slot.id === id ? { ...slot, status } : slot));
  };

  const confirmed = slots.filter(slot => slot.status === 'confirmed').length;

  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Parent relationships"
        title="Parent meetings"
        description="Publish slots, let families book, and keep one log of every conversation. Video links are generated automatically."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Publish availability</button>}
      >
        <StatGrid
          items={[
            { label: 'Confirmed', value: String(confirmed), detail: '4 November · 14:00 – 16:00' },
            { label: 'Requests', value: String(slots.filter(slot => slot.status === 'requested').length), detail: 'Awaiting your confirmation', tone: 'warn' },
            { label: 'Slots available', value: String(slots.filter(slot => slot.status === 'available').length), detail: 'Families can book online' },
            { label: 'Avg. meeting', value: '18 min', detail: 'Response target 24 hours' },
          ]}
        />

        <Panel title="Conference slots" description="Each slot shows the family, the learner and the meeting mode." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Time</Th><Th>Family</Th><Th>Learner</Th><Th>Mode</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <Td className="font-semibold text-[#2f3338]">{slot.time}</Td>
                    <Td>{slot.parent}</Td>
                    <Td>{slot.student}</Td>
                    <Td>{slot.mode}</Td>
                    <Td><Badge tone={statusTone(slot.status)}>{slot.status}</Badge></Td>
                    <Td className="text-right">
                      {slot.status === 'requested' && (
                        <button type="button" onClick={() => setState(slot.id, 'confirmed')} className="rounded bg-[#2e9fff] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#1f8eef]">Confirm</button>
                      )}
                      {slot.status === 'available' && (
                        <button type="button" onClick={() => setState(slot.id, 'requested')} className="rounded border border-[#d8dde4] px-2.5 py-1.5 text-[11px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Reserve</button>
                      )}
                      {slot.status === 'confirmed' && <span className="text-[11px] text-[#9aa3ad]">Video link sent</span>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="This family conversation" description="Log entries improve the next meeting.">
            <ul className="space-y-3 text-[13px] leading-6 text-[#4a515a]">
              <li><span className="font-semibold text-[#2f3338]">21 Oct — Hassan Ahmed (Amina):</span> Discussed design showcase and exam revision. Agreed a 20-minute daily study block.</li>
              <li><span className="font-semibold text-[#2f3338]">16 Sep — Mariama Yusuf (Ibrahim):</span> Reading support referral explained; guardian consented to pull-out sessions.</li>
              <li><span className="font-semibold text-[#2f3338]">12 Sep — Ngozi Nwosu (Chloe):</span> Evening attendance concerns; transport issue identified.</li>
            </ul>
          </Panel>
          <Panel title="Quiet hours & expectations" description="Set boundaries for parent contact.">
            <div className="space-y-3 text-[13px] text-[#4a515a]">
              <div className="flex items-center justify-between gap-3 border-b border-[#f2f4f7] pb-2.5"><span>Parent messages</span><Badge tone="info">07:00 – 18:00</Badge></div>
              <div className="flex items-center justify-between gap-3 border-b border-[#f2f4f7] pb-2.5"><span>Reply expectation</span><Badge tone="neutral">1 school day</Badge></div>
              <div className="flex items-center justify-between gap-3"><span>Escalation</span><Badge tone="warn">Class tutor → HoD</Badge></div>
            </div>
            <div className="mt-4">
              <Callout tone="info" title="Every message is logged and visible to authorised staff.">
                Parent contact outside the platform is discouraged so the school keeps one communication record.
              </Callout>
            </div>
          </Panel>
        </div>
      </PageFrame>
    </ConsoleShell>
  );
}
