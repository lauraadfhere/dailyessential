'use client';

import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from './language-switcher';
import { useI18n } from './language-provider';
import { legalDocument } from '../lib/i18n/legal';

export default function InformationPage({ docKey }: { docKey: 'policies' | 'privacy' | 'terms' }) {
  const { locale, t } = useI18n();
  const doc = legalDocument(docKey, locale);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <header className="bg-[#1738a8] px-4 py-3 sm:px-9">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center" aria-label="Daily Essential School home">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={136} height={56} className="h-auto w-[100px] object-contain sm:w-[120px]" priority />
          </Link>
          <LanguageSwitcher variant="onDark" className="rounded-full" />
        </div>
      </header>
      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <Link href="/" className="font-semibold text-[#1738a8] hover:underline">
          {t('Home')}
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span>{doc.title}</span>
      </div>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">{doc.eyebrow}</p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-5 py-5 text-3xl font-bold text-slate-900 sm:text-4xl">{doc.title}</h1>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[.14em] text-slate-500">{doc.updated}</p>
        <p className="mt-6 text-lg leading-8 text-slate-700">{doc.intro}</p>

        <div className="mt-10 space-y-6">
          {doc.sections.map((section, index) => (
            <section key={section.heading} className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1738a8] text-xs font-bold text-white">{index + 1}</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{section.heading}</h2>
                  <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-5 text-sm font-bold text-[#1738a8]">
          <Link href="/policies" className="hover:underline">
            {t('Policies')}
          </Link>
          <Link href="/privacy" className="hover:underline">
            {t('Privacy')}
          </Link>
          <Link href="/terms" className="hover:underline">
            {t('Terms of use')}
          </Link>
          <Link href="/pricing" className="hover:underline">
            {t('Pricing')}
          </Link>
          <Link href="/contact" className="hover:underline">
            {t('Contact us')}
          </Link>
        </div>
      </article>
    </main>
  );
}
