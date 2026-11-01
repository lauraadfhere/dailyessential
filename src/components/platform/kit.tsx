import type { ReactNode } from 'react';

/**
 * Shared presentation primitives for the ATLAS pages.
 *
 * `console` matches the existing staff consoles (#2e343b header, #2e9fff accent),
 * `portal` matches the blue student/parent portal (#1738a8).
 */

export type Tone = 'neutral' | 'brand' | 'info' | 'success' | 'warn' | 'danger';

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-[#f2f4f7] text-[#4a515a]',
  brand: 'bg-[#e8eefc] text-[#1738a8]',
  info: 'bg-[#eaf6ff] text-[#1372b8]',
  success: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
};

const barStyles: Record<Tone, string> = {
  neutral: 'bg-[#9aa3ad]',
  brand: 'bg-[#1738a8]',
  info: 'bg-[#2e9fff]',
  success: 'bg-emerald-500',
  warn: 'bg-amber-500',
  danger: 'bg-rose-500',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${toneStyles[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  const value = status.toLowerCase();
  if (/(paid|complete|confirmed|approved|active|ready|verified|on track|on time|published|graded|present|enrolled|excellent|expert)/.test(value)) return 'success';
  if (/(overdue|rejected|at-risk|absent|high|danger|failed|full)/.test(value)) return 'danger';
  if (/(pending|partial|awaiting|review|requested|watch|due|late|in progress|queued|medium|needs|developing)/.test(value)) return 'warn';
  if (/(new|scheduled|open|submitted|marked|offer)/.test(value)) return 'info';
  return 'neutral';
}

export function PageFrame({
  eyebrow,
  title,
  description,
  actions,
  variant = 'console',
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  variant?: 'console' | 'portal';
  children: ReactNode;
}) {
  const accent = variant === 'portal' ? 'text-[#1738a8]' : 'text-[#2e9fff]';
  const heading = variant === 'portal' ? 'text-[#15133d]' : 'text-[#2f3338]';
  const border = variant === 'portal' ? 'border-slate-300' : 'border-[#e6e9ee]';
  const muted = variant === 'portal' ? 'text-slate-500' : 'text-[#6b7380]';

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-7">
      <div className={`mb-5 flex flex-col gap-4 border-b ${border} pb-5 sm:flex-row sm:items-end sm:justify-between`}>
        <div className="min-w-0">
          {eyebrow && <p className={`text-[11px] font-bold uppercase tracking-[.16em] ${accent}`}>{eyebrow}</p>}
          <h1 className={`mt-1.5 text-xl font-bold sm:text-2xl ${heading}`}>{title}</h1>
          {description && <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-lg border border-[#e1e5eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
      {(title || action) && (
        <div className="flex flex-col gap-2 border-b border-[#eef1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-[#2f3338]">{title}</h2>}
            {description && <p className="mt-1 text-[13px] leading-5 text-[#6b7380]">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`px-5 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function StatGrid({
  items,
  columns = 4,
}: {
  items: { label: string; value: string; detail?: string; tone?: Tone }[];
  columns?: 2 | 3 | 4;
}) {
  const grid = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={`grid gap-3 ${grid}`}>
      {items.map(item => (
        <article key={item.label} className="rounded-lg border border-[#e1e5eb] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">{item.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${item.tone === 'danger' ? 'text-rose-600' : item.tone === 'warn' ? 'text-amber-600' : 'text-[#2f3338]'}`}>{item.value}</p>
          {item.detail && <p className="mt-1 text-[12px] leading-5 text-[#6b7380]">{item.detail}</p>}
        </article>
      ))}
    </div>
  );
}

export function Progress({ value, tone = 'info', label }: { value: number; tone?: Tone; label?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
          <span className="truncate text-[#4a515a]">{label}</span>
          <span className="shrink-0 font-semibold text-[#4a515a]">{Math.round(width)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef1f4]" role="progressbar" aria-valuenow={Math.round(width)} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
        <span className={`block h-full rounded-full ${barStyles[tone]}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function BarList({
  items,
  tone = 'info',
}: {
  items: { label: string; value: number; display?: string; hint?: string }[];
  tone?: Tone;
}) {
  const max = Math.max(...items.map(item => item.value), 1);
  return (
    <ul className="space-y-3.5">
      {items.map(item => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate text-[#3d4450]">{item.label}</span>
            <span className="shrink-0 font-semibold text-[#2f3338]">{item.display || item.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-sm bg-[#f2f4f7]">
            <span className={`block h-full ${barStyles[tone]}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          {item.hint && <p className="mt-1 text-[11px] text-[#9aa3ad]">{item.hint}</p>}
        </li>
      ))}
    </ul>
  );
}

export function KeyValueGrid({ items, columns = 2 }: { items: { label: string; value: ReactNode }[]; columns?: 2 | 3 | 4 }) {
  const grid = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <dl className={`grid gap-3 ${grid}`}>
      {items.map(item => (
        <div key={item.label} className="rounded border border-[#eef1f4] bg-[#f8f9fb] p-3.5">
          <dt className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">{item.label}</dt>
          <dd className="mt-1.5 text-[13px] font-semibold text-[#2f3338]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Callout({ tone = 'info', title, children }: { tone?: Tone; title: string; children?: ReactNode }) {
  const border = { neutral: 'border-[#9aa3ad]', brand: 'border-[#1738a8]', info: 'border-[#2e9fff]', success: 'border-emerald-500', warn: 'border-amber-500', danger: 'border-rose-500' }[tone];
  const bg = { neutral: 'bg-[#f8f9fb]', brand: 'bg-[#f4f7ff]', info: 'bg-[#f3f9ff]', success: 'bg-emerald-50/60', warn: 'bg-amber-50/70', danger: 'bg-rose-50/70' }[tone];
  return (
    <div className={`rounded-r-md border-l-4 ${border} ${bg} px-4 py-3 text-[13px] leading-6 text-[#4a515a]`}>
      <p className="font-semibold text-[#2f3338]">{title}</p>
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-1 py-6 text-center text-[13px] text-[#9aa3ad]">{children}</p>;
}

export const tableHead = 'bg-[#f7f9fb] text-[10px] font-bold uppercase tracking-[.1em] text-[#9aa3ad]';
export const th = 'px-4 py-3 text-left font-bold';
export const td = 'px-4 py-3 align-top text-[13px] text-[#4a515a]';

export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <th className={`${th} ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`${td} ${className}`}>{children}</td>;
}

export function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-[13px] font-semibold text-[#2e9fff] hover:underline">
      {children}
    </a>
  );
}
