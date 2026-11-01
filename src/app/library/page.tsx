'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PdfViewer from '../../components/pdf-viewer';

type Doc = {
  id: string;
  title: string;
  summary: string;
  category: string;
  programme: string;
  fileUrl: string;
  pages: number;
  uploadedByName: string;
};

const fallbackDocs: Doc[] = [
  {
    id: 'sample-1',
    title: 'Daily Essential Learner Handbook',
    summary: 'Policies, attendance and portal guidance for learners.',
    category: 'Handbook',
    programme: 'General',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pages: 1,
    uploadedByName: 'Daily Essential Library',
  },
  {
    id: 'sample-2',
    title: 'Assessment Guidelines',
    summary: 'How marks, evaluations and appeals work at Daily Essential.',
    category: 'Assessments',
    programme: 'General',
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    pages: 14,
    uploadedByName: 'Examinations Office',
  },
];

export default function LibraryPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    fetch(`/api/documents?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const rows = (data.documents as Doc[]) || [];
        const list = rows.length ? rows : fallbackDocs;
        setDocs(list);
        setSelected(current => current || list[0] || null);
      })
      .catch(() => {
        setDocs(fallbackDocs);
        setSelected(fallbackDocs[0]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="min-h-screen bg-[#f4f5fa] text-slate-900">
      <header className="bg-[#1738a8] px-3 sm:px-5">
        <div className="mx-auto flex h-[58px] max-w-[1180px] items-center justify-between gap-2 sm:h-[64px]">
          <Link href="/" className="shrink-0">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={120} height={48} className="h-auto w-[96px] object-contain sm:w-[110px]" />
          </Link>
          <nav className="flex max-w-[65%] items-center gap-2 overflow-x-auto text-xs font-semibold text-white/90 sm:max-w-none sm:gap-4 sm:text-sm">
            <Link href="/courses" className="whitespace-nowrap hover:text-white">Courses</Link>
            <Link href="/dummi-ai" className="whitespace-nowrap hover:text-white">DAMMI AI</Link>
            <Link href="/student/profile" className="whitespace-nowrap hover:text-white">Profile</Link>
            <Link href="/contact" className="whitespace-nowrap hover:text-white">Support</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Document vault</p>
        <h1 className="mt-2 text-2xl font-bold text-[#15133d] sm:text-3xl">PDF library</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Open learning PDFs inside Daily Essential — no popup reader.
        </p>

        <div className="mt-5 sm:mt-6">
          <input
            value={q}
            onChange={event => setQ(event.target.value)}
            placeholder="Search documents…"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1738a8] sm:max-w-md"
          />
        </div>

        <div className="mt-5 grid gap-4 lg:mt-6 lg:grid-cols-[300px_1fr] lg:gap-5">
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:p-3">
            {loading && <p className="p-3 text-sm text-slate-500">Loading documents…</p>}
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
              {docs.map(doc => (
                <li key={doc.id} className="min-w-[200px] lg:min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelected(doc)}
                    className={`w-full rounded px-3 py-3 text-left transition ${selected?.id === doc.id ? 'bg-[#1738a8] text-white' : 'bg-slate-50 hover:bg-slate-100 lg:bg-transparent lg:hover:bg-slate-50'}`}
                  >
                    <p className="truncate text-sm font-bold">{doc.title}</p>
                    <p className={`mt-1 text-xs ${selected?.id === doc.id ? 'text-white/75' : 'text-slate-500'}`}>
                      {doc.category} · {doc.pages ? `${doc.pages} pages` : 'PDF'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="min-w-0">
            {selected ? (
              <>
                <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-bold text-[#1738a8] sm:text-xl">{selected.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{selected.summary}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {selected.programme || 'General'} · uploaded by {selected.uploadedByName}
                  </p>
                </div>
                <PdfViewer url={selected.fileUrl} title={selected.title} />
              </>
            ) : (
              <div className="grid min-h-[280px] place-items-center rounded border border-slate-200 bg-white text-sm text-slate-500 sm:min-h-[420px]">
                Select a document to read.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
