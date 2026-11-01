'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '../../components/site-header';
import { useI18n } from '../../components/language-provider';
import { formatCurrency, type Locale } from '../../lib/i18n/config';
import { annualSaving, planAddOns, plans, RATE_NOTE } from '../../lib/pricing';

type Currency = 'DZD' | 'USD';

const faqs: { q: Record<Locale, string>; a: Record<Locale, string> }[] = [
  {
    q: {
      en: 'How is a learner counted?',
      fr: 'Comment un élève est-il compté ?',
      ar: 'كيف يتم احتساب الطالب؟',
    },
    a: {
      en: 'One active learner account on the platform. Applicants who have not been admitted are free until they are enrolled.',
      fr: 'Un compte élève actif sur la plateforme. Les candidats non admis sont gratuits jusqu’à leur inscription.',
      ar: 'حساب طالب واحد نشط على المنصة. المتقدمون غير المقبولين مجانيون حتى تسجيلهم.',
    },
  },
  {
    q: {
      en: 'Can we pay in dinar?',
      fr: 'Peut-on payer en dinar ?',
      ar: 'هل يمكن الدفع بالدينار؟',
    },
    a: {
      en: 'Yes. Algerian schools are invoiced in DZD by bank transfer or CCP. International schools are invoiced in USD.',
      fr: 'Oui. Les écoles algériennes sont facturées en DZD par virement ou CCP. Les écoles internationales en USD.',
      ar: 'نعم. تُفوتر المدارس الجزائرية بالدينار عبر التحويل البنكي أو CCP، والمدارس الدولية بالدولار.',
    },
  },
  {
    q: {
      en: 'What happens when term ends?',
      fr: 'Que se passe-t-il à la fin du trimestre ?',
      ar: 'ماذا يحدث في نهاية الفصل؟',
    },
    a: {
      en: 'Plans are monthly and can be paused between terms. Learner records, grades and portfolios are retained.',
      fr: 'Les forfaits sont mensuels et peuvent être suspendus entre les trimestres. Les dossiers sont conservés.',
      ar: 'الخطط شهرية ويمكن إيقافها بين الفصول، مع الاحتفاظ بسجلات الطلاب والدرجات.',
    },
  },
];

export default function PricingPage() {
  const { locale, t } = useI18n();
  const [currency, setCurrency] = useState<Currency>(locale === 'ar' ? 'DZD' : 'USD');
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    setCurrency(locale === 'ar' ? 'DZD' : 'USD');
  }, [locale]);

  const copy = useMemo(() => ({
    eyebrow: { en: 'Daily Essential School / Pricing', fr: 'Daily Essential School / Tarifs', ar: 'مدرسة دايلي إسينشال / الأسعار' }[locale],
    title: { en: 'One platform, one clear monthly price', fr: 'Une plateforme, un prix mensuel clair', ar: 'منصة واحدة بسعر شهري واضح' }[locale],
    intro: {
      en: 'Every plan includes the course catalogue, student portal, digital ID and DAMMI AI support. Prices are per learner, per month, and can be paid in Algerian dinar or US dollars.',
      fr: 'Chaque forfait inclut le catalogue de cours, le portail élève, la carte numérique et DAMMI AI. Les prix sont par élève et par mois, en dinar algérien ou en dollar.',
      ar: 'تشمل كل خطة كتالوج الدورات وبوابة الطالب والبطاقة الرقمية ودعم DAMMI AI. الأسعار لكل طالب شهريًا، ويمكن الدفع بالدينار الجزائري أو الدولار الأمريكي.',
    }[locale],
    monthly: { en: 'Monthly', fr: 'Mensuel', ar: 'شهري' }[locale],
    annualLabel: { en: 'Annual · save 20%', fr: 'Annuel · -20 %', ar: 'سنوي · وفّر 20٪' }[locale],
    perLearner: { en: 'per learner / month', fr: 'par élève / mois', ar: 'لكل طالب / شهريًا' }[locale],
    choose: { en: 'Choose plan', fr: 'Choisir ce forfait', ar: 'اختيار الخطة' }[locale],
    popular: { en: 'Most popular', fr: 'Le plus choisi', ar: 'الأكثر اختيارًا' }[locale],
    included: { en: 'What is included', fr: 'Ce qui est inclus', ar: 'ما يشمله' }[locale],
    addOns: { en: 'Add-ons', fr: 'Options', ar: 'إضافات' }[locale],
    addOnsNote: {
      en: 'Optional extras, charged only when used. School-wide training and data migration are quoted separately.',
      fr: 'Options facturées uniquement à l’usage. Formation et migration de données sur devis.',
      ar: 'إضافات اختيارية تُحتسب عند الاستخدام فقط. التدريب وترحيل البيانات بعرض سعر منفصل.',
    }[locale],
    billedAnnually: { en: 'billed annually', fr: 'facturé annuellement', ar: 'تُحتسب سنويًا' }[locale],
    totalYear: { en: 'per learner / year', fr: 'par élève / an', ar: 'لكل طالب / سنويًا' }[locale],
    faq: { en: 'Billing questions', fr: 'Questions de facturation', ar: 'أسئلة الفوترة' }[locale],
    talk: { en: 'Talk to admissions', fr: 'Parler aux admissions', ar: 'تحدث مع القبول' }[locale],
    start: { en: 'Apply for admission', fr: "Demander l'admission", ar: 'تقديم طلب القبول' }[locale],
    rate: { en: 'Exchange reference', fr: 'Référence de change', ar: 'مرجع سعر الصرف' }[locale],
    rateNote: {
      en: 'Prices are fixed in each currency, so the amount you see is the amount you pay. The dinar and dollar prices are aligned at the Bank of Algeria reference rate.',
      fr: 'Les prix sont fixés dans chaque devise : le montant affiché est celui payé. Les prix en dinar et en dollar sont alignés sur le taux de la Banque d’Algérie.',
      ar: 'الأسعار ثابتة بكل عملة، فالمبلغ المعروض هو ما تدفعه. ويتم توافق سعر الدينار والدولار وفق سعر بنك الجزائر المرجعي.',
    }[locale],
  }), [locale]);

  const price = (plan: typeof plans[number]) => {
    const monthly = currency === 'DZD' ? plan.dzdMonthly : plan.usdMonthly;
    const effective = annual ? Math.round(monthly * 0.8) : monthly;
    return { monthly: formatCurrency(effective, currency, locale), annualTotal: formatCurrency(annualSaving(monthly), currency, locale) };
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader active="pricing" />

      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="font-semibold text-[#1738a8] hover:underline">{t('Home')}</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>{t('Pricing')}</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">{copy.eyebrow}</p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900 sm:px-5 sm:py-5 sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">{copy.intro}</p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex border border-slate-300 text-[12px] font-bold">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={`px-4 py-2 transition ${!annual ? 'bg-[#1738a8] text-white' : 'bg-white text-slate-600 hover:text-[#1738a8]'}`}
            >
              {copy.monthly}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={`px-4 py-2 transition ${annual ? 'bg-[#1738a8] text-white' : 'bg-white text-slate-600 hover:text-[#1738a8]'}`}
            >
              {copy.annualLabel}
            </button>
          </div>

          <div className="inline-flex border border-slate-300 text-[12px] font-bold" role="group" aria-label="Currency">
            {(['DZD', 'USD'] as Currency[]).map(code => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                aria-pressed={currency === code}
                className={`px-4 py-2 transition ${currency === code ? 'bg-black text-white' : 'bg-white text-slate-600 hover:text-black'}`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {plans.map(plan => {
            const { monthly, annualTotal } = price(plan);
            return (
              <article
                key={plan.id}
                className={`flex flex-col border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${plan.highlighted ? 'border-[#1738a8] ring-2 ring-[#1738a8]/15' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{plan.name[locale]}</h2>
                  {plan.highlighted && (
                    <span className="shrink-0 bg-[#ffbb2c] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">{copy.popular}</span>
                  )}
                </div>
                <p className="mt-2 min-h-[40px] text-[13px] leading-5 text-slate-600">{plan.tagline[locale]}</p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-3xl font-bold text-[#1738a8]">{monthly}</p>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.perLearner}
                    {annual ? ` · ${copy.billedAnnually}` : ''}
                  </p>
                  {annual && <p className="mt-1 text-[11px] text-slate-500">{annualTotal} {copy.totalYear}</p>}
                </div>

                <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-6 text-slate-600">
                  {plan.features.map(feature => (
                    <li key={feature.en} className="flex gap-2">
                      <span aria-hidden="true" className="font-bold text-emerald-600">✓</span>
                      <span>{feature[locale]}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/admissions"
                  className={`mt-5 block text-center px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide transition ${plan.highlighted ? 'bg-[#1738a8] text-white hover:bg-[#102d88]' : 'border border-slate-300 text-slate-700 hover:border-[#1738a8] hover:text-[#1738a8]'}`}
                >
                  {copy.choose}
                </Link>
              </article>
            );
          })}
        </div>

        <section className="mt-9 border border-slate-200 bg-[#f7f8fc] p-5 sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">{copy.addOns}</h2>
          <p className="mt-1 text-[13px] text-slate-600">{copy.addOnsNote}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-bold">{locale === 'ar' ? 'البند' : locale === 'fr' ? 'Élément' : 'Item'}</th>
                  <th className="py-2 pr-3 font-bold text-right">DZD</th>
                  <th className="py-2 pr-3 font-bold text-right">USD</th>
                  <th className="py-2 font-bold">{locale === 'ar' ? 'ملاحظة' : locale === 'fr' ? 'Remarque' : 'Note'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {planAddOns().map(addOn => (
                  <tr key={addOn.name.en}>
                    <td className="py-2.5 pr-3 font-semibold text-slate-800">{addOn.name[locale]}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{formatCurrency(addOn.dzd, 'DZD', locale)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{formatCurrency(addOn.usd, 'USD', locale)}</td>
                    <td className="py-2.5 text-slate-500">{addOn.note[locale]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {faqs.map(item => (
            <article key={item.q.en} className="border border-slate-200 p-4">
              <h3 className="text-[13px] font-bold text-[#1738a8]">{item.q[locale]}</h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">{item.a[locale]}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 border-l-4 border-[#ffbb2c] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{copy.rate}</p>
          <p className="mt-1 text-[13px] leading-6 text-slate-700">
            {copy.rateNote} <span className="font-semibold text-slate-900">1 USD ≈ 135.5 DZD</span> · {RATE_NOTE}.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/admissions" className="bg-[#1738a8] px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-white hover:bg-[#102d88]">{copy.start}</Link>
          <Link href="/contact" className="border border-slate-300 px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-slate-700 hover:border-[#1738a8] hover:text-[#1738a8]">{copy.talk}</Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f7f8fc]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-blue.png" alt="Daily Essential School" width={1000} height={280} className="h-auto w-[104px] object-contain" />
            <span>© 2026 Daily Essential School</span>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/courses" className="hover:text-[#1738a8]">{t('Courses')}</Link>
            <Link href="/pricing" className="hover:text-[#1738a8]">{t('Pricing')}</Link>
            <Link href="/policies" className="hover:text-[#1738a8]">{t('Policies')}</Link>
            <Link href="/privacy" className="hover:text-[#1738a8]">{t('Privacy')}</Link>
            <Link href="/terms" className="hover:text-[#1738a8]">{t('Terms')}</Link>
            <Link href="/contact" className="hover:text-[#1738a8]">{t('Contact')}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
