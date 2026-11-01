'use client';

import { useEffect, useRef, useState } from 'react';
import { writePortalIdentity } from '../lib/portal-session';

type AvatarUploaderProps = {
  src?: string | null;
  name?: string;
  email?: string;
  studentId?: string;
  status?: string;
  sizeClassName?: string;
  onUpdated?: (url: string) => void;
};

const fallback = '/brand/icon-512.png';

export default function AvatarUploader({
  src,
  name = 'Student',
  email,
  studentId,
  status = 'active',
  sizeClassName = 'h-20 w-20 sm:h-[104px] sm:w-[104px]',
  onUpdated,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(src || fallback);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // The profile usually arrives after this component mounts; keep the circle in sync.
  useEffect(() => {
    if (!busy && src && src !== preview) setPreview(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, busy]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose an image under 5 MB.');
      event.target.value = '';
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'avatars');
      form.append('resourceType', 'image');
      const response = await fetch('/api/media/upload', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      const saved = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          studentId,
          avatarUrl: data.url,
          avatarPublicId: data.publicId,
        }),
      });
      if (!saved.ok) {
        const failure = await saved.json().catch(() => ({}));
        throw new Error(failure.error || 'Photo uploaded but the profile could not be updated');
      }

      setPreview(data.url);
      writePortalIdentity({ avatarUrl: data.url });
      onUpdated?.(data.url);
      setMessage('Profile photo updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const tone = status.toLowerCase() === 'active' || status.toLowerCase() === 'verified'
    ? 'bg-emerald-500'
    : status.toLowerCase() === 'pending'
      ? 'bg-amber-400'
      : 'bg-slate-400';

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="Upload a new profile photo"
        className={`group relative ${sizeClassName} shrink-0 overflow-hidden rounded-full bg-[#e8eefc] ring-4 ring-white transition disabled:cursor-wait`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={name} className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#102d88]/65 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8.5h2.5L8 6h8l1.5 2.5H20v10H4z" />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wide">{busy ? 'Uploading' : 'Change'}</span>
        </span>
        <span className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white ${tone}`} title={status} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={upload} className="sr-only" />
      <p className="mt-2 text-center text-[11px] text-slate-500">Click your photo to upload a new one</p>
      {message && <p className="mt-1 text-center text-[11px] font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-1 max-w-[180px] text-center text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
