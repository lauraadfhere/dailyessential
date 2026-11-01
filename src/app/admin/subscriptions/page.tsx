'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminListPanel from '../../../components/admin-list-panel';
import AdminShell from '../../../components/admin-shell';
import {
  countByStatus,
  formatAdminDate,
  lessonSubscriptions,
  lessonsCatalog,
  type LessonSubscriptionItem,
  type SubscriptionStatus,
} from '../../../lib/admin-data';

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<LessonSubscriptionItem[]>(lessonSubscriptions);
  const [courseCards, setCourseCards] = useState(lessonsCatalog);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.subscriptions) && data.subscriptions.length) setRows(data.subscriptions);
        if (Array.isArray(data.courses) && data.courses.length) {
          setCourseCards(data.courses.slice(0, 6).map((course: { id: string; title: string; summary: string; level: string; seats: number; status: string }) => ({
            id: course.id,
            title: course.title,
            summary: course.summary,
            level: course.level || '—',
            seats: course.seats || 0,
            priceLabel: 'Included',
            status: (course.status === 'open' || course.status === 'full' || course.status === 'closed' ? course.status : 'open') as 'open' | 'full' | 'closed',
          })));
        }
      })
      .catch(() => undefined);
  }, []);

  const tabs = useMemo(() => ([
    { id: 'pending', label: 'Pending', count: countByStatus(rows, 'pending') },
    { id: 'active', label: 'Active', count: countByStatus(rows, 'active') },
    { id: 'paused', label: 'Paused', count: countByStatus(rows, 'paused') },
    { id: 'cancelled', label: 'Cancelled', count: countByStatus(rows, 'cancelled') },
    { id: 'all', label: 'All', count: rows.length },
  ] as const), [rows]);

  return (
    <AdminShell showSidebar>
      <div className="border-b border-[#eef1f4] bg-[#fafbfc] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Subscribe for Lessons</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Review learner subscriptions and open lesson seats.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {courseCards.map(lesson => (
            <article key={lesson.id} className="rounded border border-[#e1e5eb] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#2f3338]">{lesson.title}</h2>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${lesson.status === 'open' ? 'bg-[#e8f8ef] text-[#1b7a45]' : lesson.status === 'full' ? 'bg-[#fff4e5] text-[#b86e00]' : 'bg-[#f1f3f5] text-[#6b7380]'}`}>
                  {lesson.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#6b7380]">{lesson.summary}</p>
              <p className="mt-3 text-xs font-semibold text-[#2e9fff]">{lesson.priceLabel} · {lesson.seats} seats · {lesson.level}</p>
            </article>
          ))}
        </div>
      </div>

      <AdminListPanel
        tabs={[...tabs]}
        defaultTab="pending"
        searchPlaceholder="Search subscriptions..."
        emptyTitle="No lesson subscriptions in this view."
        emptyHint="New subscription requests will appear here"
      >
        {({ tab, query }) => {
          const status = tab as SubscriptionStatus;
          const filtered = rows.filter(item => {
            const statusMatch = status === 'all' || item.status === status;
            const q = !query
              || item.subscriberName.toLowerCase().includes(query)
              || item.subscriberEmail.toLowerCase().includes(query)
              || item.lessonTitle.toLowerCase().includes(query);
            return statusMatch && q;
          });
          if (!filtered.length) return null;

          return filtered.map(item => (
            <article key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold text-[#2f3338]">{item.lessonTitle}</h3>
                <p className="mt-1 text-sm text-[#6b7380]">{item.subscriberName} · {item.subscriberEmail}</p>
                <p className="mt-2 text-sm text-[#4a515a]">{item.plan} · {item.amountLabel}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa3ad]">{item.status}</p>
                <p className="mt-1 text-sm text-[#6b7380]">{formatAdminDate(item.createdAt)}</p>
              </div>
            </article>
          ));
        }}
      </AdminListPanel>
    </AdminShell>
  );
}
