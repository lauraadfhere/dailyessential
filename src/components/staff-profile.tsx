'use client';

import { useEffect, useState } from 'react';
import AvatarUploader from './avatar-uploader';
import { writePortalIdentity } from '../lib/portal-session';

type Profile = { fullName: string; email: string; avatarUrl: string; phone: string; programme: string; status: string };
type Extra = { bio: string; department: string; role: string };

const input = 'mt-1 w-full rounded border border-[#d8dde4] bg-white px-3 py-2 text-[13px] text-[#2f3338] outline-none focus:border-[#2e9fff]';
const label = 'block text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]';

const roleName: Record<string, string> = { admin: 'Administrator', teacher: 'Teacher', examiner: 'Examiner' };

/** Profile page for teachers, examiners and administrators: name, photo, phone, department and a short bio. */
export default function StaffProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [extra, setExtra] = useState<Extra>({ bio: '', department: '', role: '' });
  const [form, setForm] = useState({ displayName: '', phone: '', department: '', bio: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load your profile.');
        setProfile(data.profile as Profile);
        setExtra(data.extra as Extra);
        setForm({ displayName: data.profile.fullName || '', phone: data.profile.phone || '', department: data.extra?.department || '', bio: data.extra?.bio || '' });
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load your profile.'));
  }, []);

  const save = async () => {
    setBusy(true);
    setError('');
    setSaved('');
    try {
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save your profile.');
      setProfile(data.profile as Profile);
      setExtra(data.extra as Extra);
      writePortalIdentity({ displayName: data.profile.fullName, avatarUrl: data.profile.avatarUrl });
      setSaved('Profile saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 sm:px-7">
      <div className="border-b border-[#e6e9ee] pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9aa3ad]">My account</p>
        <h1 className="mt-1 text-xl font-bold text-[#2f3338] sm:text-2xl">My profile</h1>
        <p className="mt-1 text-[13px] text-[#6b7380]">Your name and photo appear in the header and next to your replies, grades and notes.</p>
      </div>

      {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>}
      {!profile && !error && <p className="py-8 text-center text-[13px] text-[#9aa3ad]">Loading your profile…</p>}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center border border-[#e6e9ee] bg-white p-5">
            <AvatarUploader
              src={profile.avatarUrl}
              name={profile.fullName}
              email={profile.email}
              status="active"
              onUpdated={url => setProfile(current => (current ? { ...current, avatarUrl: url } : current))}
            />
            <p className="mt-4 text-center text-[14px] font-bold text-[#2f3338]">{profile.fullName}</p>
            <p className="text-center text-[12px] text-[#6b7380]">{roleName[extra.role] || 'Staff'}</p>
            <p className="mt-1 break-all text-center text-[11px] text-[#9aa3ad]">{profile.email}</p>
          </div>

          <div className="space-y-4 border border-[#e6e9ee] bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>Full name
                <input value={form.displayName} maxLength={80} onChange={event => setForm({ ...form, displayName: event.target.value })} className={input} />
              </label>
              <label className={label}>Email (sign-in)
                <input value={profile.email} readOnly className={`${input} bg-[#f8f9fb] text-[#6b7380]`} />
              </label>
              <label className={label}>Phone
                <input value={form.phone} maxLength={40} onChange={event => setForm({ ...form, phone: event.target.value })} className={input} />
              </label>
              <label className={label}>Department / subject
                <input value={form.department} maxLength={80} onChange={event => setForm({ ...form, department: event.target.value })} className={input} />
              </label>
            </div>
            <label className={label}>About you
              <textarea value={form.bio} rows={4} maxLength={500} onChange={event => setForm({ ...form, bio: event.target.value })} className={input} />
              <span className="mt-1 block normal-case tracking-normal text-[#9aa3ad]">{form.bio.length}/500</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={save} disabled={busy || form.displayName.trim().length < 2} className="rounded bg-[#2e9fff] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef] disabled:opacity-50">{busy ? 'Saving…' : 'Save changes'}</button>
              {saved && <span role="status" className="text-[12px] font-semibold text-emerald-700">{saved}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
