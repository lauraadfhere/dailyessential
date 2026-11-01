'use client';

import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, EmptyNote, PageFrame, Panel, StatGrid } from '../../../components/platform/kit';
import { messageThreads } from '../../../lib/atlas-data';

export default function TeacherMessagesPage() {
  const [threads] = useState(messageThreads);
  const [selectedId, setSelectedId] = useState(messageThreads[0].id);
  const [draft, setDraft] = useState('');
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [sent, setSent] = useState(false);

  const selected = threads.find(thread => thread.id === selectedId) || threads[0];
  const threadReplies = replies[selected.id] || [];

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setReplies(current => ({ ...current, [selected.id]: [...(current[selected.id] || []), text] }));
    setDraft('');
    setSent(true);
  };

  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Communication"
        title="Messages"
        description="Parent and learner conversations with a full history. Messaging is limited to school hours and visible to authorised staff."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">New message</button>}
      >
        <StatGrid
          items={[
            { label: 'Unread', value: String(threads.filter(thread => thread.unread).length), detail: 'Two waiting for a reply' },
            { label: 'Open threads', value: String(threads.length), detail: 'Parents, learners and colleagues' },
            { label: 'Median reply', value: '3.2 h', detail: 'Within the school-day target' },
            { label: 'Escalations', value: '0', detail: 'No safeguarding flags this week', tone: 'success' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <Panel title="Inbox" className="overflow-hidden" bodyClassName="p-0">
            <ul className="divide-y divide-[#eef1f4]">
              {threads.map(thread => (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedId(thread.id); setSent(false); }}
                    className={`block w-full px-4 py-3.5 text-left transition hover:bg-[#f8f9fb] ${selected.id === thread.id ? 'bg-[#f3f9ff]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-[#2f3338]">{thread.from}</span>
                      <span className="shrink-0 text-[10px] text-[#9aa3ad]">{thread.when}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#9aa3ad]">{thread.role}</p>
                    <p className="mt-1 truncate text-[12px] font-medium text-[#4a515a]">{thread.subject}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[#6b7380]">{thread.preview}</p>
                    {thread.unread && <span className="mt-1.5 inline-block rounded-full bg-[#eaf6ff] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1372b8]">unread</span>}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={selected.subject} description={`${selected.from} · ${selected.role}`} action={sent ? <Badge tone="success">Reply sent</Badge> : undefined}>
            <div className="space-y-4">
              <div className="rounded border border-[#eef1f4] bg-[#f8f9fb] p-4 text-[13px] leading-6 text-[#3d4450]">
                {selected.preview}
                <p className="mt-2 text-[11px] text-[#9aa3ad]">{selected.when}</p>
              </div>

              {threadReplies.map((reply, index) => (
                <div key={`${reply}-${index}`} className="ml-auto max-w-[85%] rounded border border-[#dcebff] bg-[#f3f9ff] p-4 text-[13px] leading-6 text-[#24506f]">
                  {reply}
                  <p className="mt-2 text-[11px] text-[#7fa3bd]">You · just now</p>
                </div>
              ))}

              {!threadReplies.length && <EmptyNote>No replies yet. Keep the message short and reference the learner by name.</EmptyNote>}

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">Reply</span>
                  <textarea
                    value={draft}
                    onChange={event => { setDraft(event.target.value); setSent(false); }}
                    rows={3}
                    placeholder="Write a clear reply. Messages are visible to the tutor and safeguarding lead."
                    className="mt-1.5 w-full rounded border border-[#d8dde4] px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]"
                  />
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={send} disabled={!draft.trim()} className="rounded bg-[#2e9fff] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1f8eef] disabled:cursor-not-allowed disabled:opacity-40">Send reply</button>
                  <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[12px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Use template</button>
                  <span className="text-[11px] text-[#9aa3ad]">School hours · 07:00 – 18:00</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <Callout tone="info" title="Messaging guardrails protect everyone.">
          Learners and parents cannot see staff private contact details. Keywords that suggest a safeguarding concern are flagged to the DSL, and all threads are retained for the school’s message-retention period.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
