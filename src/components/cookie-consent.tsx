'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dailyessential.cookieConsent';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const timer = window.setTimeout(() => setOpen(true), 800);
        return () => window.clearTimeout(timer);
      }
    } catch {
      /* storage blocked — keep the banner closed */
    }
  }, []);

  const choose = (value: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="w-full max-w-md border-t-4 border-[#1738a8] bg-white p-6 shadow-2xl sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#1738a8]">Your privacy</p>
        <h2 id="cookie-title" className="mt-2 text-xl font-bold text-slate-900">Cookies and local storage</h2>
        <p className="mt-3 text-[13px] leading-6 text-slate-600">
          We use essential storage to keep you signed in and remember your preferences. With your consent we also use analytics storage to understand which lessons and pages are working.
        </p>

        <ul className="mt-4 space-y-2 text-[12px] leading-5 text-slate-600">
          <li className="flex gap-2"><span className="font-bold text-[#1738a8]">•</span><span><strong className="font-semibold text-slate-800">Essential</strong> — session, security and your cookie choice. Always on.</span></li>
          <li className="flex gap-2"><span className="font-bold text-[#1738a8]">•</span><span><strong className="font-semibold text-slate-800">Analytics</strong> — anonymous page performance. Optional.</span></li>
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => choose('all')}
            className="flex-1 bg-[#1738a8] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#102d88]"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => choose('essential')}
            className="flex-1 border border-slate-300 px-4 py-2.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Essential only
          </button>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-slate-500">
          Read our <Link href="/privacy" className="font-semibold text-[#1738a8] hover:underline">privacy policy</Link> for how learner data is stored. You can change this choice any time by clearing this site&apos;s storage.
        </p>
      </div>
    </div>
  );
}
