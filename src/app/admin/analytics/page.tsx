'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../../../components/admin-shell';

type Stats = {
  students: number;
  courses: number;
  evaluationsPending: number;
  newsPublished: number;
  subscriptionsActive: number;
  ticketsOpen: number;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    students: 0,
    courses: 0,
    evaluationsPending: 0,
    newsPublished: 0,
    subscriptionsActive: 0,
    ticketsOpen: 0,
  });
  const [source, setSource] = useState('loading');

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        setSource(data.source || 'parse');
      })
      .catch(() => setSource('unavailable'));
  }, []);

  const cards = [
    [String(stats.evaluationsPending), 'Evaluation queue', 'Pending reviews'],
    [String(stats.subscriptionsActive), 'Active subscriptions', 'Confirmed lesson plans'],
    [String(stats.newsPublished), 'Published news', 'Live announcements'],
    [String(stats.students), 'Student profiles', 'Parse StudentProfile'],
    [String(stats.courses), 'Courses', 'Parse Course class'],
    [String(stats.ticketsOpen), 'Open tickets', 'SupportTicket queue'],
  ] as const;

  return (
    <AdminShell showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Student progress & engagement</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Live activity across Parse · source: {source}</p>
      </div>

      <div className="grid gap-4 px-5 py-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([value, label, hint]) => (
          <article key={label} className="rounded border border-[#e1e5eb] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <p className="text-3xl font-semibold text-[#2e9fff]">{value}</p>
            <p className="mt-2 text-sm font-semibold text-[#2f3338]">{label}</p>
            <p className="mt-1 text-xs text-[#6b7380]">{hint}</p>
          </article>
        ))}
      </div>

      <div className="mx-5 mb-8 rounded border border-[#e1e5eb] bg-white p-6">
        <h2 className="text-base font-semibold text-[#2f3338]">Analyze engagement</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7380]">
          Spot backlog in evaluation requests, confirm lesson subscription uptake, track open support tickets, and measure how often families open the latest news updates.
        </p>
        <div className="mt-6 grid h-40 grid-cols-12 items-end gap-2">
          {[42, 58, 36, 70, 64, 80, 55, 88, 72, 60, 76, 90].map((height, index) => (
            <div key={index} className="rounded-t bg-[#2e9fff]/70" style={{ height: `${height}%` }} />
          ))}
        </div>
        <p className="mt-3 text-xs text-[#9aa3ad]">Last 12 weeks · visual trend</p>
      </div>
    </AdminShell>
  );
}
