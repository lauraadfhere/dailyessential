import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, tableHead, Td, Th } from '../../../components/platform/kit';
import { permissionMatrix, roleDefinitions } from '../../../lib/atlas-data';

const delegations = [
  { person: 'Mr. Eze', grant: 'attendance.edit on JSS 2 Blue', reason: 'Substitute cover', expires: '12 Nov 2026' },
  { person: 'Ms. Bello', grant: 'grade.publish on JSS 3', reason: 'Exam officer leave', expires: '7 Nov 2026' },
  { person: 'Registrar', grant: 'student.export (whole school)', reason: 'Ministry return', expires: '1 Nov 2026' },
];

function Grant({ allowed }: { allowed: boolean }) {
  return allowed
    ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700">✓</span>
    : <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f2f4f7] text-[11px] text-[#c0c6ce]">—</span>;
}

export default function AdminRolesPage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Access control"
        title="Roles & permissions"
        description="Role answers what kind of user someone is; permission answers what they may do; scope answers on whose data. Deny by default."
        actions={<button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Create role</button>}
      >
        <StatGrid
          items={[
            { label: 'Roles', value: String(roleDefinitions.length), detail: 'Base roles plus custom clones' },
            { label: 'Staff accounts', value: '26', detail: 'MFA required for all staff' },
            { label: 'Temporary grants', value: String(delegations.length), detail: 'Auto-expire, fully logged', tone: 'warn' },
            { label: 'Overrides', value: '2', detail: 'Both approved by the Principal' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roleDefinitions.map(role => (
            <article key={role.name} className="rounded-lg border border-[#e1e5eb] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[14px] font-semibold text-[#2f3338]">{role.name}</h2>
                <Badge tone="brand">{role.users} users</Badge>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-[#6b7380]">{role.description}</p>
              <p className="mt-3 border-t border-[#f2f4f7] pt-3 text-[11px] font-semibold uppercase tracking-[.1em] text-[#9aa3ad]">Scope · {role.scope}</p>
            </article>
          ))}
        </div>

        <Panel title="Permission matrix" description="Representative grants across the six core roles." className="overflow-hidden" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}>
                <tr>
                  <Th>Permission</Th>
                  {permissionMatrix.columns.map(column => <Th key={column} className="text-center">{column}</Th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {permissionMatrix.rows.map(row => (
                  <tr key={row.label}>
                    <Td className="font-medium text-[#2f3338]">{row.label}</Td>
                    {row.grants.map((grant, index) => (
                      <Td key={`${row.label}-${permissionMatrix.columns[index]}`} className="text-center">
                        <Grant allowed={grant} />
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <Panel title="Temporary delegations" description="Elevated access always carries an expiry and a reason." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Person</Th><Th>Grant</Th><Th>Reason</Th><Th>Expires</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {delegations.map(delegation => (
                  <tr key={`${delegation.person}-${delegation.grant}`}>
                    <Td className="font-semibold text-[#2f3338]">{delegation.person}</Td>
                    <Td>{delegation.grant}</Td>
                    <Td>{delegation.reason}</Td>
                    <Td className="whitespace-nowrap">{delegation.expires}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Guardrails" description="Applied in the UI, the server action and the database.">
            <ul className="space-y-3 text-[13px] leading-6 text-[#4a515a]">
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Every mutation calls <code className="rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[11px]">can(user, permission, resource)</code>.</li>
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Row-level security scopes queries to campus, section and relationship.</li>
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Multiple roles per person are supported with an in-app role switcher.</li>
              <li className="flex gap-2"><span className="text-[#2e9fff]">•</span>Impersonation requires a reason and is prominently audited.</li>
            </ul>
          </Panel>
        </div>

        <Callout tone="warn" title="A teacher who is also a parent has two scopes.">
          The portal switcher changes the active scope; permissions never leak across roles, and parent access to their own child is separate from class access.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
