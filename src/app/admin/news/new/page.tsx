'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import AdminShell from '../../../../components/admin-shell';

export default function AdminNewsNewPage() {
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <AdminShell showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <Link href="/admin/news" className="text-sm font-medium text-[#2e9fff] hover:underline">← Back to news</Link>
        <h1 className="mt-3 text-lg font-semibold text-[#2f3338]">Create news update</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Draft an announcement for learners, families and staff.</p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5 px-5 py-8">
        <label className="block">
          <span className="text-xs font-semibold text-[#4a515a]">Title</span>
          <input required name="title" className="mt-1 h-10 w-full rounded border border-[#d8dde4] px-3 text-sm outline-none focus:border-[#2e9fff]" placeholder="Announcement title" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#4a515a]">Summary</span>
          <input name="summary" className="mt-1 h-10 w-full rounded border border-[#d8dde4] px-3 text-sm outline-none focus:border-[#2e9fff]" placeholder="One-line summary" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#4a515a]">Category</span>
          <select name="category" className="mt-1 h-10 w-full rounded border border-[#d8dde4] px-3 text-sm outline-none focus:border-[#2e9fff]">
            <option>Updates</option>
            <option>Academics</option>
            <option>Lessons</option>
            <option>Events</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-[#4a515a]">Body</span>
          <textarea required name="body" rows={8} className="mt-1 w-full rounded border border-[#d8dde4] px-3 py-2 text-sm outline-none focus:border-[#2e9fff]" placeholder="Write the full update..." />
        </label>
        <label className="flex items-center gap-2 text-sm text-[#4a515a]">
          <input type="checkbox" name="pinned" className="accent-[#2e9fff]" />
          Pin to top of latest news
        </label>
        {saved && <p className="rounded border border-[#cdeedc] bg-[#f0faf4] px-3 py-2 text-sm text-[#1b7a45]">Draft saved locally. Connect Parse NewsUpdate to persist.</p>}
        <div className="flex gap-3">
          <button type="submit" className="rounded bg-[#2e9fff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f8eef]">Save draft</button>
          <Link href="/admin/news" className="rounded border border-[#d8dde4] px-4 py-2 text-sm font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Cancel</Link>
        </div>
      </form>
    </AdminShell>
  );
}
