'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

type DocType = 'birth-certificate' | 'report-card' | 'passport-photo' | 'guardian-id' | 'transfer-letter' | 'proof-of-address' | 'medical-record';

type UploadedDoc = { type: DocType; label: string; url: string; publicId?: string; uploadedAt: string };

const steps = [
  { title: 'Application', detail: 'Ten minutes: your child’s details, guardians and previous school.', chip: 'You do this' },
  { title: 'Documents', detail: 'Birth certificate, last report and a passport photograph.', chip: 'Upload now' },
  { title: 'Assessment', detail: 'A friendly placement check in English and mathematics.', chip: 'We schedule' },
  { title: 'Review', detail: 'The admissions officer reads every file and any AI summary.', chip: 'Human decision' },
  { title: 'Decision', detail: 'Offer, waitlist or guidance within five working days.', chip: 'By email' },
];

const documentSlots: { type: DocType; label: string; hint: string; required: boolean; accept: string }[] = [
  { type: 'birth-certificate', label: 'Birth certificate / passport page', hint: 'PDF or clear photo', required: true, accept: 'image/*,application/pdf' },
  { type: 'report-card', label: 'Most recent school report', hint: 'PDF or clear photo', required: true, accept: 'image/*,application/pdf' },
  { type: 'passport-photo', label: 'Passport photograph', hint: 'JPG or PNG', required: true, accept: 'image/jpeg,image/png' },
  { type: 'guardian-id', label: 'Parent or guardian ID', hint: 'PDF, JPG or PNG', required: true, accept: 'image/jpeg,image/png,application/pdf' },
  { type: 'transfer-letter', label: 'Transfer letter', hint: 'Only if moving schools', required: false, accept: 'image/*,application/pdf' },
  { type: 'proof-of-address', label: 'Proof of address', hint: 'Optional', required: false, accept: 'image/jpeg,image/png,application/pdf' },
  { type: 'medical-record', label: 'Vaccination / medical record', hint: 'Optional', required: false, accept: 'image/*,application/pdf' },
];

const programmes = [
  { name: 'Junior Secondary', grades: 'JSS 1 – JSS 3', focus: 'Broad foundation, digital literacy, study skills', fee: '₦145,000 / term' },
  { name: 'Senior Secondary', grades: 'SS 1 – SS 2', focus: 'Design, computing, business and sciences', fee: '₦145,000 / term' },
  { name: 'Digital Learning Hub', grades: 'JSS 1 – SS 2', focus: 'Blended and online learning pathway', fee: '₦98,000 / term' },
  { name: 'Evening Programme', grades: 'JSS 3 – SS 1', focus: 'After-hours classes for working learners', fee: '₦78,000 / term' },
];

const tracker = [
  ['Application received', 'Submitted'],
  ['Documents review', 'Admissions checks every upload'],
  ['Entrance assessment', 'Invitation sent by email'],
  ['Interview (if shortlisted)', 'Scheduled with the team'],
  ['Decision', 'Offer, waitlist or guidance'],
];

const emptyForm = {
  child: '', dateOfBirth: '', gender: '', nationality: '', address: '', grade: 'JSS 1',
  guardian: '', guardianRelationship: '', email: '', phone: '', emergencyContact: '',
  school: '', lastClassCompleted: '', reasonForLeaving: '', medicalNotes: '', notes: '',
};

export default function AdmissionsPage() {
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState<Partial<Record<DocType, UploadedDoc>>>({});
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [docError, setDocError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<{ reference: string; documents: number; grade: string } | null>(null);
  const inputs = useRef<Partial<Record<DocType, HTMLInputElement | null>>>({});

  const requiredDone = documentSlots.filter(slot => slot.required && documents[slot.type]).length;
  const requiredTotal = documentSlots.filter(slot => slot.required).length;

  const upload = async (slot: (typeof documentSlots)[number], file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setDocError('Each file must be under 8 MB.');
      return;
    }
    setUploading(slot.type);
    setDocError('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'admissions');
      body.append('resourceType', file.type === 'application/pdf' ? 'raw' : 'image');
      const response = await fetch('/api/media/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setDocuments(current => ({
        ...current,
        [slot.type]: { type: slot.type, label: slot.label, url: data.url, publicId: data.publicId, uploadedAt: new Date().toISOString() },
      }));
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
      const input = inputs.current[slot.type];
      if (input) input.value = '';
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (requiredDone < requiredTotal) {
      setError('Upload the birth certificate, the last school report, a passport photograph and a parent or guardian ID before submitting.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: form.child,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          nationality: form.nationality,
          address: form.address,
          grade: form.grade,
          guardianName: form.guardian,
          guardianRelationship: form.guardianRelationship,
          guardianEmail: form.email,
          guardianPhone: form.phone,
          emergencyContact: form.emergencyContact,
          previousSchool: form.school,
          lastClassCompleted: form.lastClassCompleted,
          reasonForLeaving: form.reasonForLeaving,
          medicalNotes: form.medicalNotes,
          notes: form.notes,
          documents: Object.values(documents),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit the application');
      setSubmitted({
        reference: data.application.reference,
        documents: data.application.documents.length,
        grade: data.application.grade,
      });
      setForm(emptyForm);
      setDocuments({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the application');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <header className="bg-[#1738a8] px-4 py-3 sm:px-9">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center" aria-label="Daily Essential School home">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={136} height={56} className="h-auto w-[100px] object-contain sm:w-[120px]" priority />
          </Link>
          <div className="flex items-center gap-3 text-[12px] font-semibold text-white/90 sm:text-[13px]">
            <Link href="/courses" className="hover:text-white">Courses</Link>
            <Link href="/login/student" className="rounded bg-white/15 px-3 py-1.5 hover:bg-white/25">Portal login</Link>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 text-sm sm:px-9">
        <Link href="/" className="font-semibold text-[#1738a8] hover:underline">Home</Link>
        <span className="mx-2 text-slate-400">/</span>
        <span>Admissions</span>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1738a8]">Daily Essential School / Join us</p>
        <h1 className="mt-3 border-b-4 border-[#1738a8] bg-[#e9eef5] px-4 py-4 text-2xl font-bold text-slate-900 sm:px-5 sm:py-5 sm:text-4xl">Admissions</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8">
          A clear, paperless path from your first question to your child’s first day. Send the form and the documents below, track every stage and talk to a real admissions officer when you need to.
        </p>

        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">How your application moves</h2>
            <span className="border border-[#1738a8]/20 bg-[#e8eefc] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#1738a8]">
              Apply → Upload → Assess → Review → Decide
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <article key={step.title} className="flex flex-col border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e8eefc] text-[12px] font-bold text-[#1738a8]">{index + 1}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{step.chip}</span>
                </div>
                <h3 className="mt-3 text-[13px] font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-[12px] leading-5 text-slate-600">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-slate-900">Start an application</h2>
            <p className="mt-1 text-sm text-slate-500">Fill the form and attach the three required documents. Nothing is sent until you submit.</p>

            {submitted ? (
              <div className="mt-5">
                <div className="border-l-4 border-emerald-500 bg-emerald-50 px-4 py-4">
                  <p className="font-bold text-emerald-800">Application received — {submitted.reference}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {submitted.documents} document{submitted.documents === 1 ? '' : 's'} received for {submitted.grade}. Our admissions team reviews files in the order received.
                  </p>
                </div>

                <div className="mt-5 border border-slate-200">
                  <p className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-slate-500">Application tracker</p>
                  <ol className="divide-y divide-slate-100">
                    {tracker.map(([title, detail], index) => {
                      const done = index === 0;
                      const current = index === 1;
                      return (
                        <li key={title} className="flex items-start gap-3 px-4 py-3">
                          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${done ? 'bg-emerald-500 text-white' : current ? 'bg-[#1738a8] text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {done ? '✓' : index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-[13px] font-semibold ${current ? 'text-[#1738a8]' : 'text-slate-800'}`}>{title}</p>
                            <p className="text-[11px] text-slate-500">{detail}</p>
                          </div>
                          {current && <span className="ml-auto shrink-0 bg-[#e8eefc] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1738a8]">In progress</span>}
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSubmitted(null)} className="border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">Start another application</button>
                  <Link href="/contact" className="bg-[#1738a8] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#102d88]">Contact admissions</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">Child’s full name<input required value={form.child} onChange={event => setForm({ ...form, child: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Grade applying for
                    <select value={form.grade} onChange={event => setForm({ ...form, grade: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal">
                      {['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2'].map(grade => <option key={grade}>{grade}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">Parent / guardian<input required value={form.guardian} onChange={event => setForm({ ...form, guardian: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Guardian email<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Phone<input required value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Current / previous school<input value={form.school} onChange={event => setForm({ ...form, school: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Date of birth<input required type="date" value={form.dateOfBirth} onChange={event => setForm({ ...form, dateOfBirth: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Gender
                    <select required value={form.gender} onChange={event => setForm({ ...form, gender: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal">
                      <option value="">Select</option>
                      {['Female', 'Male', 'Other'].map(option => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">Nationality<input required value={form.nationality} onChange={event => setForm({ ...form, nationality: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold sm:col-span-2">Home address<input required value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Relationship to child<input required value={form.guardianRelationship} onChange={event => setForm({ ...form, guardianRelationship: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Emergency contact<input required value={form.emergencyContact} onChange={event => setForm({ ...form, emergencyContact: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Last class completed<input value={form.lastClassCompleted} onChange={event => setForm({ ...form, lastClassCompleted: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold">Reason for leaving previous school<input value={form.reasonForLeaving} onChange={event => setForm({ ...form, reasonForLeaving: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                  <label className="text-sm font-semibold sm:col-span-2">Medical or special needs<textarea rows={2} value={form.medicalNotes} onChange={event => setForm({ ...form, medicalNotes: event.target.value })} className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" /></label>
                </div>

                <div className="border border-slate-200 bg-[#f7f8fc] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900">Documents to upload</h3>
                      <p className="text-[11px] text-slate-500">PDF, JPG or PNG · up to 8 MB each. Files are stored securely and read only by admissions.</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[11px] font-bold ${requiredDone === requiredTotal ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {requiredDone}/{requiredTotal} required
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {documentSlots.map(slot => {
                      const doc = documents[slot.type];
                      const isUploading = uploading === slot.type;
                      return (
                        <li key={slot.type} className="flex flex-wrap items-center gap-3 border border-slate-200 bg-white px-3 py-2.5">
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${doc ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {doc ? '✓' : slot.required ? '!' : '–'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px] font-semibold text-slate-800">
                              {slot.label}
                              {slot.required ? <span className="ml-1 text-red-500">*</span> : <span className="ml-1 text-[10px] font-normal uppercase tracking-wide text-slate-400">optional</span>}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {isUploading ? 'Uploading…' : doc ? (
                                <>Uploaded · <a href={doc.url} target="_blank" rel="noreferrer" className="font-semibold text-[#1738a8] underline">view file</a></>
                              ) : slot.hint}
                            </p>
                          </div>
                          <input
                            ref={element => { inputs.current[slot.type] = element; }}
                            type="file"
                            accept={slot.accept}
                            className="sr-only"
                            onChange={event => {
                              const file = event.target.files?.[0];
                              if (file) void upload(slot, file);
                            }}
                          />
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => inputs.current[slot.type]?.click()}
                            className="shrink-0 border border-[#1738a8] px-2.5 py-1.5 text-[11px] font-bold text-[#1738a8] hover:bg-[#e8eefc] disabled:opacity-50"
                          >
                            {isUploading ? 'Uploading…' : doc ? 'Replace' : 'Upload'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {docError && <p className="mt-2 text-[11px] font-semibold text-red-600">{docError}</p>}
                </div>

                <label className="block text-sm font-semibold">Anything we should know?
                  <textarea rows={4} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} placeholder="Learning support needs, siblings at the school, preferred campus…" className="mt-2 w-full rounded border border-slate-200 px-3 py-2.5 font-normal" />
                </label>

                {error && <p className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-700">{error}</p>}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={busy || requiredDone < requiredTotal} className="bg-[#1738a8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#102d88] disabled:cursor-not-allowed disabled:opacity-50">
                    {busy ? 'Submitting…' : 'Submit application'}
                  </button>
                  <p className="text-[11px] text-slate-500">No application fee. Your details are used only for admissions and are never sold.</p>
                </div>
              </form>
            )}
          </section>

          <aside className="space-y-6">
            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">What approval needs</h2>
              <ul className="mt-3 space-y-2 text-[13px] leading-5 text-slate-600">
                {[
                  'A complete application form with a reachable guardian',
                  'Birth certificate or passport page',
                  'Most recent school report',
                  'Passport photograph',
                  'Transfer letter or medical record where relevant',
                ].map(item => (
                  <li key={item} className="flex gap-2"><span className="text-[#1738a8]">✓</span>{item}</li>
                ))}
              </ul>
              <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
                A file is only marked complete once it is readable. Blurred uploads are returned for a clearer copy.
              </p>
            </section>

            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Visit the campus</h2>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">Tours run every Tuesday at 10:00 and Thursday at 14:00 during term time.</p>
              <p className="mt-3 text-[13px] font-semibold text-slate-800">Main Campus, Daily Essential School</p>
              <p className="text-[12px] text-slate-500">admissions@dailyessential.school · +234 800 000 0000</p>
              <Link href="/contact" className="mt-4 inline-block bg-[#1738a8] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#102d88]">Book a tour</Link>
            </section>
          </aside>
        </div>

        <section className="mt-9">
          <h2 className="text-lg font-bold text-slate-900">Programmes and fees</h2>
          <div className="mt-4 overflow-x-auto border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Programme</th>
                  <th className="px-4 py-3 text-left">Grades</th>
                  <th className="px-4 py-3 text-left">Focus</th>
                  <th className="px-4 py-3 text-left">Tuition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programmes.map(item => (
                  <tr key={item.name}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.grades}</td>
                    <td className="px-4 py-3 text-slate-600">{item.focus}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{item.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Fees are per term and exclude optional transport, meals and trips. Sibling and scholarship discounts are available.</p>
        </section>

        <div className="mt-9 flex flex-wrap gap-5 text-sm font-bold text-[#1738a8]">
          <Link href="/policies" className="hover:underline">School policies</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/contact" className="hover:underline">Contact admissions</Link>
        </div>
      </div>
    </main>
  );
}
