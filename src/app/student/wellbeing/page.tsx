'use client';

import Link from 'next/link';
import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid } from '../../../components/platform/kit';
import { moodWeek, wellbeingResources } from '../../../lib/atlas-data';

const moods = [
  { score: 1, label: 'Struggling', face: '😔' },
  { score: 2, label: 'Low', face: '🙁' },
  { score: 3, label: 'Okay', face: '😐' },
  { score: 4, label: 'Good', face: '🙂' },
  { score: 5, label: 'Great', face: '😄' },
];

export default function StudentWellbeingPage() {
  const [mood, setMood] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);

  return (
    <PortalShell role="student">
      <PageFrame
        variant="portal"
        eyebrow="Student space"
        title="Wellbeing"
        description="A private check-in space. Your daily check-in is anonymous; a counselling request is only visible to you, your counsellor and the safeguarding lead."
      >
        <StatGrid
          items={[
            { label: 'This week', value: '4 / 5', detail: 'Average of your check-ins' },
            { label: 'Resources', value: String(wellbeingResources.length), detail: 'Guides, audio and videos' },
            { label: 'Counsellor', value: 'Available', detail: 'Drop-in Tuesday 14:00', tone: 'success' },
            { label: 'Confidentiality', value: 'Protected', detail: 'Only your counsellor sees requests' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <Panel title="How are you today?" description="One tap. You can add a note if you want to.">
            {mood === null ? (
              <div className="grid grid-cols-5 gap-2">
                {moods.map(item => (
                  <button key={item.score} type="button" onClick={() => setMood(item.score)} className="rounded border border-slate-200 bg-white px-1 py-3 text-center transition hover:border-[#1738a8] hover:bg-[#f4f7ff]">
                    <span className="block text-2xl">{item.face}</span>
                    <span className="mt-1 block text-[10px] font-semibold text-slate-500">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded border-l-4 border-emerald-500 bg-emerald-50/70 p-4">
                <p className="text-[13px] font-semibold text-slate-800">Check-in recorded — thank you for sharing.</p>
                <p className="mt-1 text-[12px] leading-5 text-slate-600">
                  {mood >= 4 ? 'Glad today feels good. Keep the routines that are working for you.' : 'Thanks for being honest. A short break, water and a chat with someone you trust can help — and the counselling team is here.'}
                </p>
                <button type="button" onClick={() => setMood(null)} className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-white">Change check-in</button>
              </div>
            )}
            <ul className="mt-5 space-y-2.5">
              {moodWeek.map(day => (
                <li key={day.day} className="flex items-center gap-3 text-[12px]">
                  <span className="w-8 text-slate-400">{day.day}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-[#1738a8]" style={{ width: `${(day.score / 5) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-600">{day.score}/5</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Talk to someone" description="Confidential support, at your pace.">
            {booked ? (
              <div className="rounded border-l-4 border-emerald-500 bg-emerald-50/70 p-4 text-[13px] text-slate-700">
                <p className="font-semibold text-slate-800">Counselling request sent</p>
                <p className="mt-1">Ms. Ibrahim will contact you privately within one school day. You can cancel from this page.</p>
                <button type="button" onClick={() => setBooked(false)} className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-white">Cancel request</button>
              </div>
            ) : (
              <>
                <p className="text-[13px] leading-6 text-slate-600">
                  Request a short, private conversation. No reason is required, and your guardian is not contacted unless there is an immediate safety concern.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setBooked(true)} className="rounded bg-[#1738a8] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#102d88]">Request an appointment</button>
                  <Link href="/contact" className="rounded border border-slate-300 px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50">Contact the school</Link>
                </div>
                <div className="mt-5 rounded border border-rose-200 bg-rose-50 p-3.5">
                  <p className="text-[13px] font-bold text-rose-700">Need help now?</p>
                  <p className="mt-1 text-[12px] leading-5 text-rose-700/90">If you or someone else is in danger, tell a trusted adult immediately or call the school emergency line on +234 800 000 0000.</p>
                </div>
              </>
            )}
          </Panel>
        </div>

        <Panel title="Resources" description="Short, practical and private to read.">
          <div className="grid gap-3 sm:grid-cols-2">
            {wellbeingResources.map(resource => (
              <article key={resource.title} className="rounded border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-[#15133d]">{resource.title}</h3>
                  <Badge tone="neutral">{resource.type}</Badge>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-slate-500">Open whenever you need it. Resources are checked by the counselling team.</p>
              </article>
            ))}
          </div>
        </Panel>

        <Callout tone="brand" title="Wellbeing is part of learning.">
          If exam pressure, friendships or home life are affecting your focus, that is a normal reason to ask for support — not a sign of failure.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
