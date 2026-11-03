'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type PdfViewerProps = {
  url: string;
  title?: string;
  className?: string;
};

type Fit = 'FitH' | 'Fit';

/** In-app PDF reader: loading state, fit width/page, full screen, and download or open fallbacks. */
export default function PdfViewer(props: PdfViewerProps) {
  // Re-mount per document so loading state resets without effects.
  return <PdfViewerInner key={props.url} {...props} />;
}

function PdfViewerInner({ url, title = 'Document', className = '' }: PdfViewerProps) {
  const [mode, setMode] = useState<'iframe' | 'object'>('iframe');
  const [fit, setFit] = useState<Fit>('FitH');
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const src = useMemo(() => {
    if (!url) return '';
    const base = url.split('#')[0];
    return `${base}#toolbar=1&navpanes=1&view=${fit}`;
  }, [url, fit]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen?.().catch(() => undefined);
  };

  if (!url) {
    return (
      <div className={`grid min-h-[280px] place-items-center rounded border border-slate-200 bg-slate-50 text-sm text-slate-500 sm:min-h-[420px] ${className}`}>
        No PDF selected.
      </div>
    );
  }

  const height = fullscreen ? 'h-[calc(100vh-49px)]' : 'h-[62vh] sm:h-[78vh]';
  const button = 'border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-[#1738a8] hover:text-[#1738a8]';

  return (
    <div ref={frame} className={`overflow-hidden rounded border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#f7f8fc] px-3 py-2 sm:px-4">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1738a8]" title={title}>{title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setFit(fit === 'FitH' ? 'Fit' : 'FitH')} className={button} aria-label="Toggle fit width or whole page">
            {fit === 'FitH' ? 'Fit page' : 'Fit width'}
          </button>
          <button type="button" onClick={toggleFullscreen} className={button}>{fullscreen ? 'Exit full screen' : 'Full screen'}</button>
          <button type="button" onClick={() => setMode(mode === 'iframe' ? 'object' : 'iframe')} className={button}>Switch viewer</button>
          <a href={url} target="_blank" rel="noopener noreferrer" className={button}>Open in tab</a>
          <a href={url} download className="bg-[#1738a8] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#102d88]">Download</a>
        </div>
      </div>

      <div className="relative bg-slate-100">
        {!loaded && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-slate-50 text-center text-sm text-slate-500">
            <div>
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#1738a8]" aria-hidden="true" />
              <p className="mt-3">Loading document…</p>
              {slow && (
                <p className="mt-2 max-w-xs px-4 text-xs">
                  This is taking longer than usual. Your browser may be blocking the preview —{' '}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1738a8] underline">open the PDF in a new tab</a>.
                </p>
              )}
            </div>
          </div>
        )}
        {mode === 'iframe' ? (
          <iframe key={src} title={title} src={src} onLoad={() => setLoaded(true)} className={`${height} w-full`} />
        ) : (
          <object data={src} type="application/pdf" onLoad={() => setLoaded(true)} className={`${height} w-full`}>
            <div className={`grid ${height} place-items-center px-6 text-center text-sm text-slate-600`}>
              <div>
                <p>Inline PDF preview is unavailable in this browser.</p>
                <a href={url} className="mt-3 inline-block font-bold text-[#1738a8] hover:underline">Open PDF in this tab</a>
              </div>
            </div>
          </object>
        )}
      </div>
    </div>
  );
}
