import { notFound } from 'next/navigation';
import WorkspaceShell from '../../../../components/workspace-shell';
import { moduleBySlug, permissionsFor, roleBySlug } from '../../../../lib/school-model';

export default async function WorkspacePage({ params }: { params: Promise<{ role: string; module: string }> }) {
  const { role, module } = await params;
  const person = roleBySlug(role); const area = moduleBySlug(module);
  if (!person || !area) notFound();
  const permissions = permissionsFor(role);
  const sensitive = ['roles', 'audit', 'finance', 'ai'].includes(module);
  return <WorkspaceShell role={role} active={module}><div className="space-y-6">
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-[#1738a8]">{person[2]}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{area[1]}</h1><p className="mt-2 max-w-2xl text-slate-600">{area[2]}. This workspace applies the role, scope and approval rules defined for {person[1]}.</p></div>
    {sensitive && <div className="rounded-lg border-l-4 border-[#ffbb2c] bg-amber-50 p-4 text-sm text-slate-700"><b>Human approval required.</b> Sensitive records and high-impact decisions are never finalized by automation.</div>}
    <div className="grid gap-4 md:grid-cols-3">{[['My scope', 'Organization · campus · assigned relationships'], ['Actions available', `${permissions.length} permission grants`], ['Review status', sensitive ? 'Additional approval applies' : 'Ready for your role']].map(([label, value]) => <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-slate-800">{value}</p></article>)}</div>
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#1738a8]">Authorized capabilities</h2><div className="mt-4 flex flex-wrap gap-2">{permissions.map(permission => <span key={permission} className="rounded-full bg-[#e8effd] px-3 py-1 text-xs font-semibold text-[#1738a8]">{permission}</span>)}</div><p className="mt-5 text-sm text-slate-600">Data is filtered by organization, campus, academic year, relationship and policy. Every sensitive action is logged.</p></article>
  </div></WorkspaceShell>;
}
