import Link from 'next/link';

function SadPaperCharacter() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 140" className="absolute left-1/2 top-[-18%] h-[42%] w-auto -translate-x-1/2 text-black/45">
      <rect x="28" y="8" width="64" height="78" rx="4" fill="#f3f4f6" stroke="currentColor" strokeWidth="3" />
      <path d="M76 8v18h18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M76 8 94 26" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="48" cy="42" r="3.5" fill="#111" />
      <circle cx="72" cy="42" r="3.5" fill="#111" />
      <path d="M50 58c6 6 14 6 20 0" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 55c-10 4-16 14-14 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M92 55c10 4 16 14 14 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 86v28M72 86v28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 114h-10M72 114h10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:justify-between lg:gap-8 lg:px-10">
        <section className="w-full max-w-md text-left">
          <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl">Error 404</h1>
          <p className="mt-5 max-w-sm text-[15px] font-medium leading-7 text-black/70">
            The page you are looking for was moved, removed or might never existed.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-900"
          >
            Back to homepage
          </Link>
        </section>

        <section className="relative w-full max-w-xl select-none" aria-hidden="true">
          <div className="relative mx-auto w-full max-w-[520px] pt-16">
            <SadPaperCharacter />
            <div className="flex items-end justify-center gap-1 text-[88px] font-black leading-none tracking-tight text-black sm:text-[160px]">
              <span className="-rotate-6 origin-bottom">4</span>
              <span className="relative pb-1">0</span>
              <span className="rotate-6 origin-bottom">4</span>
            </div>
            <div className="mx-auto mt-2 h-px w-[92%] bg-black/25" />
          </div>
        </section>
      </div>
    </main>
  );
}
