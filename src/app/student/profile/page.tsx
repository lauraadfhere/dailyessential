'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AvatarUploader from '../../../components/avatar-uploader';
import StudentIdCard from '../../../components/student-id-card';
import { writePortalIdentity } from '../../../lib/portal-session';

type ProfileSection = 'personal' | 'academic' | 'verification' | 'security' | 'preferences';

type Profile = {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  backupSerial: string;
  barcodeValue: string;
  classGroup: string;
  gradeLevel: string;
  programme: string;
  campus: string;
  status: string;
  deliveryMode: string;
  guardian: string;
  guardianEmail: string;
  attendance: string;
  avatarUrl: string;
  phone: string;
  country: string;
  address: string;
};

const sections: { id: ProfileSection; label: string }[] = [
  { id: 'personal', label: 'Personal information' },
  { id: 'academic', label: 'Academic details' },
  { id: 'verification', label: 'Status & identity' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
];

function Field({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input type={type} defaultValue={value} className="mt-2 block w-full rounded border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#1738a8] focus:ring-2 focus:ring-[#dce6ff]" />
    </label>
  );
}

function StatusBadge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' }) {
  const styles = { blue: 'bg-[#e8eefc] text-[#1738a8]', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' };
}

export default function StudentProfile() {
  const [active, setActive] = useState<ProfileSection>('personal');
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState<{ key: string; file: string; fileName: string } | null>(null);

  useEffect(() => {
    const email = (() => {
      try { return sessionStorage.getItem('bifti.userEmail') || ''; } catch { return ''; }
    })();
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    params.set('role', 'student');

    fetch(`/api/profile?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const next = data.profile;
        setProfile(next);
        setSource(data.source || '');
        if (next) {
          writePortalIdentity({
            email: next.email,
            displayName: next.fullName,
            role: 'student',
            avatarUrl: next.avatarUrl,
            status: next.status,
            studentId: next.studentId,
            programme: next.programme,
            classGroup: next.classGroup,
            gradeLevel: next.gradeLevel,
            campus: next.campus,
          });
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));

    fetch(`/api/recovery?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.recoveryKey) {
          setRecovery({ key: data.recoveryKey, file: data.file, fileName: data.fileName || 'daily-essential-recovery.txt' });
        }
      })
      .catch(() => undefined);
  }, []);

  const saveChanges = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const name = splitName(profile?.fullName || 'Student');
  const initials = `${name.first[0] || 'B'}${name.last[0] || 'F'}`.toUpperCase();

  return (
    <main className="min-h-screen bg-[#f4f5fa] text-slate-900">
      <header className="h-[58px] bg-[#1738a8] px-4 shadow-sm sm:h-[70px] sm:px-5">
        <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between gap-3">
          <Link href="/student/dashboard" aria-label="Daily Essential School home" className="flex h-full w-[96px] items-center sm:w-[128px]">
            <Image src="/brand/logo-white.png" alt="Daily Essential School" width={136} height={56} priority className="h-auto w-full object-contain" />
          </Link>
          <Link href="/student/dashboard" className="text-xs font-semibold text-white/85 transition hover:text-white sm:text-sm">Dashboard</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 sm:mb-7">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Student account</p>
          <h1 className="mt-2 text-2xl font-bold text-[#15133d] sm:text-3xl">Profile & settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your personal information, learning details, identity card, security and portal preferences.
            {source ? <span className="ml-1 font-semibold text-[#1738a8]">Data source: {source}</span> : null}
          </p>
        </div>

        {loading && <p className="mb-4 text-sm font-semibold text-slate-500">Loading profile from Parse…</p>}

        <div className="grid gap-4 lg:grid-cols-[270px_1fr] lg:gap-5">
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 px-2 pb-4 pt-2 sm:block sm:px-3 sm:pb-5 sm:pt-3 sm:text-center">
              <div className="mx-0 sm:mx-auto sm:flex sm:justify-center">
                <AvatarUploader
                  src={profile?.avatarUrl}
                  name={profile?.fullName || initials}
                  email={profile?.email}
                  studentId={profile?.studentId}
                  status={profile?.status || 'active'}
                  onUpdated={url => {
                    setProfile(current => (current ? { ...current, avatarUrl: url } : current));
                    writePortalIdentity({ avatarUrl: url });
                  }}
                />
              </div>
              <div className="min-w-0 sm:mt-4">
                <h2 className="truncate text-base font-bold sm:text-lg">{profile?.fullName || '—'}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">Student ID: {profile?.studentId || '—'}</p>
                <div className="mt-2 flex flex-wrap gap-2 sm:mt-4 sm:justify-center">
                  <StatusBadge tone={profile?.status === 'active' ? 'green' : profile?.status === 'pending' ? 'amber' : 'blue'}>
                    {profile?.status || 'active'}
                  </StatusBadge>
                  <StatusBadge tone="green">Identity verified</StatusBadge>
                </div>
              </div>
            </div>
            <nav aria-label="Profile settings" className="mt-3 flex gap-1 overflow-x-auto pb-1 sm:block sm:space-y-1 sm:overflow-visible sm:pb-0">
              {sections.map(section => (
                <button key={section.id} type="button" onClick={() => setActive(section.id)} className={`shrink-0 rounded px-3 py-2.5 text-left text-sm font-semibold transition sm:flex sm:w-full sm:items-center sm:justify-between sm:py-3 ${active === section.id ? 'bg-[#1738a8] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:bg-transparent'}`}>
                  {section.label}
                  <span className="hidden text-xs opacity-60 sm:inline">›</span>
                </button>
              ))}
            </nav>
          </aside>

          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
            {active === 'personal' && profile && (
              <form onSubmit={saveChanges}>
                <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-xl font-bold text-[#1738a8]">Personal information</h2>
                    <p className="mt-1 text-sm text-slate-500">Keep your contact details up to date.</p>
                  </div>
                  {saved && <StatusBadge tone="green">Changes saved</StatusBadge>}
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="First name" value={name.first} />
                  <Field label="Last name" value={name.last} />
                  <Field label="Email address" value={profile.email} type="email" />
                  <Field label="Phone number" value={profile.phone} type="tel" />
                  <Field label="Country / region" value={profile.country} />
                  <Field label="Preferred language" value="English" />
                </div>
                <div className="mt-5"><Field label="Address" value={profile.address} /></div>
                <div className="mt-5 rounded border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] leading-5 text-slate-600">
                  Your profile photo is shown across the portal, on your ID card and in class lists. Use the circle at the top of this page to change it.
                </div>
                <button type="submit" className="mt-7 bg-[#1738a8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#102d88]">Save changes</button>
              </form>
            )}

            {active === 'academic' && profile && (
              <div>
                <h2 className="text-xl font-bold text-[#1738a8]">Academic details</h2>
                <p className="mt-1 text-sm text-slate-500">Your current learning programme and academic information.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ['Programme', profile.programme],
                    ['Grade level', profile.gradeLevel],
                    ['Class group', profile.classGroup],
                    ['Campus', profile.campus],
                    ['Enrollment status', profile.status],
                    ['Delivery mode', profile.deliveryMode],
                    ['Attendance', profile.attendance],
                    ['Guardian', profile.guardian],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                      <p className="mt-2 font-semibold text-slate-800">{value || '—'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/courses" className="bg-[#1738a8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#102d88]">Browse courses</Link>
                  <Link href="/library" className="border border-[#1738a8] px-5 py-2.5 text-sm font-bold text-[#1738a8] hover:bg-[#e8eefc]">Open PDF library</Link>
                </div>
              </div>
            )}

            {active === 'verification' && profile && (
              <div>
                <h2 className="text-xl font-bold text-[#1738a8]">Status & identity</h2>
                <p className="mt-1 text-sm text-slate-500">Student ID, grade, QR code and backup serial from your school record.</p>
                <div className="mt-6">
                  <StudentIdCard
                    fullName={profile.fullName}
                    studentId={profile.studentId}
                    backupSerial={profile.backupSerial}
                    barcodeValue={profile.barcodeValue}
                    programme={profile.programme}
                    classGroup={profile.classGroup}
                    campus={profile.campus}
                    gradeLevel={profile.gradeLevel}
                    status={profile.status}
                    avatarUrl={profile.avatarUrl}
                    recoveryFile={recovery?.file}
                    recoveryFileName={recovery?.fileName}
                  />
                </div>
                {recovery ? (
                  <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recovery key</p>
                    <p className="mt-2 break-all font-mono text-[13px] text-slate-800">{recovery.key}</p>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      Keep this private. Use it on the sign-in page if you forget your password.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {active === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-[#1738a8]">Security</h2>
                <p className="mt-1 text-sm text-slate-500">Protect your account and manage sign-in preferences.</p>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col gap-3 rounded border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">Password</p>
                      <p className="mt-1 text-sm text-slate-500">Managed through your portal login</p>
                    </div>
                    <Link href="/login/student" className="self-start border border-[#1738a8] px-4 py-2 text-sm font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Change password</Link>
                  </div>
                  <div className="flex flex-col gap-3 rounded border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">Two-step verification</p>
                      <p className="mt-1 text-sm text-slate-500">Add another layer of protection.</p>
                    </div>
                    <StatusBadge tone="amber">Not enabled</StatusBadge>
                  </div>
                </div>
              </div>
            )}

            {active === 'preferences' && (
              <div>
                <h2 className="text-xl font-bold text-[#1738a8]">Preferences</h2>
                <p className="mt-1 text-sm text-slate-500">Choose how the student portal keeps you informed.</p>
                <div className="mt-6 space-y-4">
                  {['Course announcements', 'Assessment reminders', 'Schedule changes', 'Learning recommendations'].map(label => (
                    <label key={label} className="flex items-center justify-between rounded border border-slate-200 p-4 text-sm font-semibold">
                      <span>{label}</span>
                      <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#1738a8]" />
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => setSaved(true)} className="mt-7 bg-[#1738a8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#102d88]">Save preferences</button>
                {saved && <p className="mt-3 text-sm font-semibold text-emerald-700">Preferences saved.</p>}
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Image src="/brand/logo-blue.png" alt="Daily Essential School" width={86} height={36} className="h-auto w-[86px] object-contain" />
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-[#1738a8]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1738a8]">Terms</Link>
            <Link href="/contact" className="hover:text-[#1738a8]">Contact support</Link>
            <span>© 2026 Daily Essential School</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
