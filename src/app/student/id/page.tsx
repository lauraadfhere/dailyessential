'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import StudentIdCard from '../../../components/student-id-card';
import { writePortalIdentity } from '../../../lib/portal-session';

type Profile = {
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
  avatarUrl: string;
};

type Recovery = {
  recoveryKey: string;
  file: string;
  fileName: string;
};

export default function StudentIdPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let email = '';
    try { email = sessionStorage.getItem('bifti.userEmail') || ''; } catch { /* ignore */ }
    const params = new URLSearchParams({ role: 'student' });
    if (email) params.set('email', email);

    Promise.all([
      fetch(`/api/profile?${params.toString()}`).then(response => response.json()),
      fetch(`/api/recovery?${params.toString()}`).then(response => response.json()),
    ])
      .then(([profileData, recoveryData]) => {
        if (profileData.profile) {
          setProfile(profileData.profile);
          writePortalIdentity({
            email: profileData.profile.email,
            displayName: profileData.profile.fullName,
            role: 'student',
            avatarUrl: profileData.profile.avatarUrl,
            status: profileData.profile.status,
            studentId: profileData.profile.studentId,
            programme: profileData.profile.programme,
            classGroup: profileData.profile.classGroup,
            campus: profileData.profile.campus,
          });
        }
        if (recoveryData.recoveryKey) {
          setRecovery({
            recoveryKey: recoveryData.recoveryKey,
            file: recoveryData.file,
            fileName: recoveryData.fileName || 'daily-essential-recovery.txt',
          });
        } else if (recoveryData.error) {
          setError(recoveryData.error);
        }
      })
      .catch(() => setError('Could not load your identity details.'))
      .finally(() => setLoading(false));
  }, []);

  const gradeLabel = useMemo(() => {
    if (!profile) return '—';
    const grade = profile.gradeLevel || '';
    const group = profile.classGroup || '';
    return [grade, group].filter(Boolean).join(' · ') || '—';
  }, [profile]);

  return (
    <PortalShell role="student">
      <section className="mb-5 border-b border-slate-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1738a8]">Identity</p>
        <h2 className="mt-1 text-lg font-bold text-[#15133d] sm:text-xl">Student ID, QR code &amp; recovery key</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Copy your student ID, scan the QR code for campus check-in and download a recovery key that restores portal
          access if you forget your password.
        </p>
      </section>

      {loading && <p className="mb-4 text-sm font-semibold text-slate-500">Loading your identity record…</p>}
      {error && <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-800">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          {profile ? (
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
          ) : (
            !loading && <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">No identity record found.</p>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-[#1738a8]">How to use your ID</h3>
            <ul className="mt-3 space-y-2 text-[13px] leading-6 text-slate-600">
              <li className="flex gap-2"><span className="font-bold text-[#1738a8]">1.</span>Show the QR code at the campus gate, library desk and exam hall.</li>
              <li className="flex gap-2"><span className="font-bold text-[#1738a8]">2.</span>Quote your student ID when contacting the school office.</li>
              <li className="flex gap-2"><span className="font-bold text-[#1738a8]">3.</span>Never share your recovery key or post a copy of it online.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-[#1738a8]">Your grade</h3>
            <p className="mt-3 text-3xl font-bold text-slate-900">{profile?.gradeLevel || '—'}</p>
            <p className="mt-1 text-sm text-slate-500">{gradeLabel}</p>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                <dt className="text-slate-500">Programme</dt>
                <dd className="text-right font-semibold text-slate-800">{profile?.programme || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Campus</dt>
                <dd className="text-right font-semibold text-slate-800">{profile?.campus || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Enrolment</dt>
                <dd className="text-right font-semibold capitalize text-emerald-700">{profile?.status || 'active'}</dd>
              </div>
            </dl>
            <Link href="/student/grades" className="mt-4 inline-block text-[12px] font-bold text-[#1738a8] hover:underline">
              Open my gradebook →
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-sm font-bold text-[#1738a8]">Recovery key</h3>
            <p className="mt-2 text-[12px] leading-5 text-slate-600">
              Use this key on the sign-in page if you cannot remember your password. Keep it somewhere private.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[12px] text-slate-800">
                {recovery ? (revealed ? recovery.recoveryKey : '••••••••••••••••••••') : 'Not available'}
              </code>
              <button
                type="button"
                onClick={() => setRevealed(value => !value)}
                className="rounded border border-slate-300 px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-[#1738a8] hover:text-[#1738a8]"
              >
                {revealed ? 'Hide' : 'Show'}
              </button>
            </div>
            {recovery ? (
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([recovery.file], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = recovery.fileName;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  URL.revokeObjectURL(url);
                }}
                className="mt-3 w-full rounded bg-[#1738a8] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#102d88]"
              >
                Download recovery key file
              </button>
            ) : null}
            <p className="mt-3 text-[11px] leading-5 text-slate-500">
              Lost your key? Download it again here, or ask the school office to verify it for you.
            </p>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
