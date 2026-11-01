import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminShell from '../../../../components/admin-shell';
import { formatAdminDate, newsUpdates } from '../../../../lib/admin-data';

export default async function AdminNewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = newsUpdates.find(entry => entry.id === id);
  if (!item) notFound();

  return (
    <AdminShell showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <Link href="/admin/news" className="text-sm font-medium text-[#2e9fff] hover:underline">← Back to news</Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-[#2f3338]">{item.title}</h1>
          <span className="rounded bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6b7380]">{item.status}</span>
        </div>
        <p className="mt-2 text-sm text-[#6b7380]">{item.category} · {item.authorName} · {formatAdminDate(item.publishedAt)}</p>
      </div>
      <article className="mx-auto max-w-2xl px-5 py-8">
        <p className="text-base font-medium leading-7 text-[#2f3338]">{item.summary}</p>
        <p className="mt-5 text-sm leading-7 text-[#4a515a]">{item.body}</p>
        <div className="mt-8 flex gap-3">
          <Link href="/admin/news/new" className="rounded bg-[#2e9fff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f8eef]">Duplicate as draft</Link>
          <Link href="/admin/news" className="rounded border border-[#d8dde4] px-4 py-2 text-sm font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Close</Link>
        </div>
      </article>
    </AdminShell>
  );
}
