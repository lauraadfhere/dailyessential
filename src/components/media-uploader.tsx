'use client';

import { useState } from 'react';

type MediaUploaderProps = {
  folder?: string;
  resourceType?: 'image' | 'raw' | 'auto';
  accept?: string;
  label?: string;
  onUploaded?: (result: { url: string; publicId: string; format?: string }) => void;
};

/** Uploads files through `/api/media/upload` (Cloudinary signed upload). */
export default function MediaUploader({
  folder = 'uploads',
  resourceType = 'auto',
  accept = 'image/*,application/pdf',
  label = 'Upload file',
  onUploaded,
}: MediaUploaderProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      form.append('resourceType', file.type === 'application/pdf' ? 'raw' : resourceType);
      const response = await fetch('/api/media/upload', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      setPreview(data.url);
      onUploaded?.({ url: data.url, publicId: data.publicId, format: data.format });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  return (
    <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-4">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        <input type="file" accept={accept} disabled={busy} onChange={onChange} className="mt-2 block w-full text-sm" />
      </label>
      {busy && <p className="mt-2 text-xs font-semibold text-[#1738a8]">Uploading to Cloudinary…</p>}
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      {preview && (
        <p className="mt-2 truncate text-xs text-emerald-700">
          Uploaded: <a href={preview} className="font-bold underline" target="_self">{preview}</a>
        </p>
      )}
    </div>
  );
}
