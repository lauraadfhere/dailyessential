'use client';

import { useMemo, useState } from 'react';

type PdfViewerProps = {
  url: string;
  title?: string;
  className?: string;
};

/** In-app PDF reader — opens inside the platform (no popup window). */
export default function PdfViewer({ url, title = 'Document', className = '' }: PdfViewerProps) {
  const [mode, setMode] = useState<'iframe' | 'object'>('iframe');
  const src = useMemo(() => {
    if (!url) return '';
    return url.includes('#') ? url : `${url}#toolbar=1&navpanes=0&view=FitH`;
  }, [url]);

  if (!url) {
    return (
      <div className={`grid min-h-[280px] place-items-center rounded border border-slate-200 bg-slate-50 text-sm text-slate-500 sm:min-h-[420px] ${className}`}>
        No PDF selected.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#f7f8fc] px-3 py-2.5 sm:px-4">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1738a8]">{title}</p>
        <div className="flex items-center gap-3 text-xs font-bold">
          <button type="button" onClick={() => setMode(mode === 'iframe' ? 'object' : 'iframe')} className="text-slate-500 hover:text-[#1738a8]">
            Switch viewer
          </button>
          <a href={url} download className="text-[#1738a8] hover:underline">
            Download
          </a>
        </div>
      </div>
      {mode === 'iframe' ? (
        <iframe title={title} src={src} className="h-[55vh] w-full bg-slate-100 sm:h-[72vh]" />
      ) : (
        <object data={url} type="application/pdf" className="h-[55vh] w-full sm:h-[72vh]">
          <div className="grid h-[55vh] place-items-center px-6 text-center text-sm text-slate-600 sm:h-[72vh]">
            <div>
              <p>Inline PDF preview is unavailable in this browser.</p>
              <a href={url} className="mt-3 inline-block font-bold text-[#1738a8] hover:underline">
                Open PDF in this tab
              </a>
            </div>
          </div>
        </object>
      )}
    </div>
  );
}
