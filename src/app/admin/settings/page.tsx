import AdminShell from '../../../components/admin-shell';
import { adminCampuses } from '../../../lib/admin-data';

export default function AdminSettingsPage() {
  return (
    <AdminShell showSidebar>
      <div className="border-b border-[#eef1f4] px-5 py-4">
        <h1 className="text-lg font-semibold text-[#2f3338]">Settings</h1>
        <p className="mt-1 text-sm text-[#6b7380]">Organization, access and import/export controls for the school admin workspace.</p>
      </div>

      <div className="space-y-8 px-5 py-8">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[.14em] text-[#9aa3ad]">Campuses</h2>
          <div className="mt-3 divide-y divide-[#eef1f4] rounded border border-[#e1e5eb] bg-white">
            {adminCampuses.map(campus => (
              <div key={campus.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-[#2f3338]">{campus.name}</p>
                  <p className="text-[#6b7380]">{campus.learners} learners</p>
                </div>
                <button type="button" className="text-[#2e9fff] hover:underline">Manage</button>
              </div>
            ))}
          </div>
        </section>

        <section id="filters">
          <h2 className="text-sm font-bold uppercase tracking-[.14em] text-[#9aa3ad]">Word filters</h2>
          <p className="mt-2 text-sm text-[#6b7380]">Block spam phrases in evaluation and subscription forms.</p>
          <textarea className="mt-3 h-28 w-full max-w-xl rounded border border-[#d8dde4] px-3 py-2 text-sm outline-none focus:border-[#2e9fff]" defaultValue={'cheap certificate\nbuy diploma\nfree vpn'} />
        </section>

        <section id="access">
          <h2 className="text-sm font-bold uppercase tracking-[.14em] text-[#9aa3ad]">Access controls</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#4a515a]">
            <li className="rounded border border-[#e1e5eb] bg-white px-4 py-3">School administrators can approve evaluations and publish news.</li>
            <li className="rounded border border-[#e1e5eb] bg-white px-4 py-3">Teachers can review assigned evaluation requests only.</li>
            <li className="rounded border border-[#e1e5eb] bg-white px-4 py-3">Finance officers confirm paid lesson subscriptions.</li>
          </ul>
        </section>

        <section id="import" className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-[#e1e5eb] bg-white p-5">
            <h2 className="font-semibold text-[#2f3338]">Import</h2>
            <p className="mt-2 text-sm text-[#6b7380]">Import learner lists, lesson seats or news drafts from CSV.</p>
            <button type="button" className="mt-4 rounded border border-[#d8dde4] px-3 py-2 text-xs font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Choose file</button>
          </div>
          <div id="export" className="rounded border border-[#e1e5eb] bg-white p-5">
            <h2 className="font-semibold text-[#2f3338]">Export</h2>
            <p className="mt-2 text-sm text-[#6b7380]">Export evaluation queues, subscriptions and published news.</p>
            <button type="button" className="mt-4 rounded bg-[#2e9fff] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f8eef]">Download CSV</button>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
