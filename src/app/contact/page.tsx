'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MediaUploader from '../../components/media-uploader';

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  requesterName: string;
  message: string;
};

const offices = [
  { title: 'Portal support', detail: 'Sign-in, password resets, role access and student ID issues.', channel: 'tickets · category: portal', hours: 'Mon–Fri · 08:00–18:00' },
  { title: 'Academic office', detail: 'Timetables, class changes, evaluations and programme placement.', channel: 'tickets · category: academics', hours: 'Mon–Fri · 09:00–16:00' },
  { title: 'Finance desk', detail: 'Fees, receipts, subscriptions and payment confirmations.', channel: 'tickets · category: finance', hours: 'Mon–Fri · 09:00–15:00' },
  { title: 'Campus front desk', detail: 'Main Campus visitors, guardian visits and facilities requests.', channel: 'Main Campus reception', hours: 'Mon–Sat · 08:00–17:00' },
];

export default function ContactPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [form, setForm] = useState({
    requesterName: '',
    requesterEmail: '',
    subject: '',
    category: 'portal',
    priority: 'normal',
    message: '',
  });

  useEffect(() => {
    fetch('/api/tickets?limit=8')
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('');
    setError('');
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attachmentUrl: attachmentUrl || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit ticket');
      setStatus(`Ticket submitted (${data.id}). Our team will follow up by email.`);
      setForm({ requesterName: '', requesterEmail: '', subject: '', category: 'portal', priority: 'normal', message: '' });
      setAttachmentUrl('');
      const refreshed = await fetch('/api/tickets?limit=8').then(res => res.json());
      setTickets(refreshed.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <header className="bg-[#1738a8] px-4 py-3 sm:px-9">
        <Link href="/" className="inline-flex items-center" aria-label="Daily Essential School home">
          <Image src="/brand/logo-white.png" alt="Daily Essential School" width={136} height={56} className="h-auto w-[100px] object-contain sm:w-[120px]" priority />
        </Link>
      </header>
      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <Link href="/" className="font-semibold text-[#1738a8] hover:underline">Home</Link>
        <span className="mx-2 text-slate-400">/</span>
        <span>Contact support</span>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">Daily Essential School / Support</p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900 sm:px-5 sm:py-5 sm:text-4xl">Contact school support</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8">
          Need help with your portal, courses or school services? Open a support ticket — it is stored on Parse and attachments go to Cloudinary.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {offices.map(office => (
            <article key={office.title} className="border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#1738a8]">{office.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{office.detail}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{office.channel}</p>
              <p className="mt-1 text-xs text-slate-500">{office.hours}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <form onSubmit={submit} className="border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Submit a ticket</h2>
            <p className="mt-1 text-sm text-slate-500">Linked to Parse SupportTicket class.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Full name<input required value={form.requesterName} onChange={e => setForm({ ...form, requesterName: e.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Email<input required type="email" value={form.requesterEmail} onChange={e => setForm({ ...form, requesterEmail: e.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Subject<input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
              <label className="text-sm font-semibold">Category
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal">
                  <option value="portal">Portal</option>
                  <option value="academics">Academics</option>
                  <option value="finance">Finance</option>
                  <option value="facilities">Facilities</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Priority
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Message
                <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" />
              </label>
            </div>
            <div className="mt-4">
              <MediaUploader folder="tickets" accept="image/*,application/pdf" label="Attach screenshot or PDF" onUploaded={result => setAttachmentUrl(result.url)} />
            </div>
            <button type="submit" className="mt-6 bg-[#1738a8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#102d88]">Send ticket</button>
            {status && <p className="mt-3 text-sm font-semibold text-emerald-700">{status}</p>}
            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          </form>

          <aside className="border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Recent tickets</h2>
            <p className="mt-1 text-xs text-slate-500">Live from Parse</p>
            <ul className="mt-4 space-y-3">
              {tickets.length === 0 && <li className="text-sm text-slate-500">No tickets yet.</li>}
              {tickets.map(ticket => (
                <li key={ticket.id} className="rounded border border-slate-100 bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-800">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">{ticket.category} · {ticket.status} · {ticket.priority}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{ticket.message}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 text-sm font-bold text-[#1738a8]">
              <Link href="/library" className="block hover:underline">PDF library →</Link>
              <Link href="/student/profile" className="block hover:underline">Student ID card →</Link>
              <Link href="/policies" className="block hover:underline">Policies →</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
