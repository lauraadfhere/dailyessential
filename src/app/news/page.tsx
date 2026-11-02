import Image from 'next/image';
import Link from 'next/link';
import { formatAdminDate } from '../../lib/admin-data';
import { fetchNews } from '../../lib/platform-data';

export const metadata = {
  title: 'Latest news',
  description: 'School announcements, evaluations and lesson updates from Daily Essential School.',
  alternates: { canonical: 'https://dailyessential.ca/news' },
};

export default async function PublicNewsPage() {
  const news = await fetchNews();
  const published = news.filter(item => item.status === 'published');

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#2f3338]">
      <header className="bg-[#2e343b] text-white">
        <div className="mx-auto flex h-[54px] max-w-[980px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Daily Essential School home">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={108} height={44} className="h-8 w-auto object-contain" />
          </Link>
          <nav className="flex max-w-[60%] items-center gap-2 overflow-x-auto text-xs sm:max-w-none sm:gap-4 sm:text-sm">
            <Link href="/library" className="whitespace-nowrap text-white/80 hover:text-white">PDF library</Link>
            <Link href="/access" className="hidden whitespace-nowrap text-white/80 hover:text-white sm:inline">Role access</Link>
            <Link href="/admin/login" className="whitespace-nowrap rounded border border-white/25 px-2.5 py-1.5 text-white/90 hover:bg-white/10 sm:px-3">
              Admin login
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#2e9fff]">Daily Essential School</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Latest news & updates</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b7380]">
          Stay informed about evaluations, lesson subscriptions and school community announcements.
        </p>

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
          {published.map(item => (
            <article key={item.id} className="rounded-md border border-[#e1e5eb] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {item.pinned && <span className="rounded bg-[#e8f5ff] px-2 py-0.5 text-[10px] font-bold uppercase text-[#2e9fff]">Pinned</span>}
                <span className="rounded bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6b7380]">{item.category}</span>
                <span className="text-xs text-[#9aa3ad]">{formatAdminDate(item.publishedAt)}</span>
              </div>
              <h2 className="mt-3 text-base font-semibold text-[#2f3338] sm:text-lg">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7380]">{item.summary || item.body}</p>
              <p className="mt-3 text-xs text-[#9aa3ad]">By {item.authorName}</p>
            </article>
          ))}
          {!published.length && (
            <p className="rounded border border-dashed border-[#d8dde4] bg-white p-5 text-sm text-[#6b7380] sm:p-6">
              No published news in Parse yet. Seed data or create an update in Admin → News.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
