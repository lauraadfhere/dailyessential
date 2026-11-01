'use client';

import { useEffect, useState } from 'react';

type StudentIdCardProps = {
  fullName: string;
  studentId: string;
  backupSerial: string;
  barcodeValue: string;
  programme?: string;
  classGroup?: string;
  campus?: string;
  gradeLevel?: string;
  status?: string;
  avatarUrl?: string;
  recoveryFile?: string;
  recoveryFileName?: string;
};

function avatarSrc(name: string, url?: string) {
  if (url) return url;
  return '/brand/icon-512.png';
}

function qrPayload(input: { studentId: string; fullName: string; email?: string; gradeLevel?: string }) {
  return [
    'DAILYESSENTIAL-STUDENT',
    `id:${input.studentId}`,
    `name:${input.fullName}`,
    input.gradeLevel ? `grade:${input.gradeLevel}` : '',
    'verify:/student/id',
  ].filter(Boolean).join('|');
}

/** Student identity card with QR code, copyable ID and a downloadable recovery key. */
export default function StudentIdCard({
  fullName,
  studentId,
  backupSerial,
  barcodeValue,
  programme = '',
  classGroup = '',
  campus = '',
  gradeLevel = '',
  status = 'active',
  avatarUrl = '',
  recoveryFile,
  recoveryFileName = 'daily-essential-recovery.txt',
}: StudentIdCardProps) {
  const bars = buildBarcodePattern(barcodeValue || studentId);
  const [copied, setCopied] = useState<'id' | 'serial' | ''>('');

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(''), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async (value: string, which: 'id' | 'serial') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      // Clipboard API can be blocked; fall back to a temporary selection.
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        setCopied(which);
      } catch {
        setCopied('');
      }
      document.body.removeChild(area);
    }
  };

  const download = () => {
    if (!recoveryFile) return;
    const blob = new Blob([recoveryFile], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = recoveryFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1738a8] px-5 py-3 text-white">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70">Daily Essential School · Student ID</p>
          <h3 className="mt-1 text-lg font-bold">{fullName}</h3>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
          {status || 'active'}
        </span>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[88px_1fr_112px]">
        <div className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[#e8eefc] ring-2 ring-[#1738a8]/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarSrc(fullName, avatarUrl)} alt={fullName} className="h-full w-full object-cover" />
        </div>

        <div className="space-y-1.5 text-sm">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500">Student ID:</span>
            <span className="font-mono font-semibold text-slate-900">{studentId}</span>
            <button
              type="button"
              onClick={() => copy(studentId, 'id')}
              className="rounded border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-[#1738a8] hover:text-[#1738a8]"
            >
              {copied === 'id' ? 'Copied' : 'Copy'}
            </button>
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500">Backup serial:</span>
            <span className="font-mono text-slate-800">{backupSerial}</span>
            <button
              type="button"
              onClick={() => copy(backupSerial, 'serial')}
              className="rounded border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 transition hover:border-[#1738a8] hover:text-[#1738a8]"
            >
              {copied === 'serial' ? 'Copied' : 'Copy'}
            </button>
          </p>
          <p><span className="font-bold text-slate-500">Grade:</span> <span className="font-semibold text-slate-900">{gradeLevel || '—'}</span></p>
          <p><span className="font-bold text-slate-500">Programme:</span> {programme || '—'}</p>
          <p><span className="font-bold text-slate-500">Class:</span> {classGroup || '—'} · {campus || '—'}</p>
        </div>

        <div className="justify-self-start sm:justify-self-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr?size=200&data=${encodeURIComponent(qrPayload({ studentId, fullName, gradeLevel }))}`}
            alt={`QR code for student ${studentId}`}
            width={104}
            height={104}
            className="h-[104px] w-[104px] rounded border border-slate-200 bg-white p-1"
          />
          <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scan to verify</p>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-[#f7f8fc] px-5 py-4">
        <svg role="img" aria-label={`Barcode ${barcodeValue}`} viewBox={`0 0 ${bars.length * 2} 48`} className="h-12 w-full max-w-md">
          {bars.map((on, index) =>
            on ? <rect key={index} x={index * 2} y={0} width={2} height={36} fill="#111" /> : null,
          )}
        </svg>
        <p className="mt-1 font-mono text-xs tracking-[.25em] text-slate-700">{barcodeValue}</p>
      </div>

      {recoveryFile ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <p className="text-[12px] leading-5 text-slate-600">
            Download your recovery key to sign in again if you forget your password.
          </p>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-2 rounded bg-[#1738a8] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#102d88]"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" />
            </svg>
            Download recovery key
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Deterministic bar pattern from the ID string (display barcode, not a scanner codec). */
function buildBarcodePattern(value: string) {
  const seed = value || 'Daily Essential';
  const pattern: boolean[] = [true, true, false];
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    for (let bit = 0; bit < 7; bit++) {
      pattern.push(Boolean((code >> bit) & 1));
      pattern.push(false);
    }
  }
  pattern.push(true, false, true);
  return pattern;
}
