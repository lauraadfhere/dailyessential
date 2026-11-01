import ConsoleShell from '../../../components/console-shell';
import { Badge, BarList, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { currency, feePlans, financeAging, invoices, scholarships } from '../../../lib/atlas-data';

export default function AdminFinancePage() {
  const billed = invoices.reduce((total, invoice) => total + invoice.amount, 0);
  const collected = invoices.reduce((total, invoice) => total + invoice.paid, 0);
  const outstanding = billed - collected;
  const overdue = invoices.filter(invoice => invoice.status === 'overdue').length;
  const collectionRate = Math.round((collected / billed) * 100);

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Finance"
        title="Fees & payments"
        description="Invoices, instalments, waivers and reconciliation. Money is stored in minor units and every adjustment keeps an approval trail."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Export ledger</button>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Record payment</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Billed this term', value: currency(billed), detail: `${invoices.length} invoices across 3 campuses` },
            { label: 'Collected', value: currency(collected), detail: `${collectionRate}% collection rate` },
            { label: 'Outstanding', value: currency(outstanding), detail: `${overdue} invoices overdue`, tone: 'danger' },
            { label: 'Scholarships', value: String(scholarships.length), detail: 'One award under committee review' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <Panel title="Aging" description="Outstanding balance by days past due.">
            <BarList items={financeAging.map(bucket => ({ label: bucket.bucket, value: bucket.share, display: currency(bucket.amount), hint: `${bucket.share}% of arrears` }))} tone="warn" />
          </Panel>
          <Panel title="Recent invoices" description="Instalment plans and payment status." className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Invoice</Th><Th>Family</Th><Th>Amount</Th><Th>Paid</Th><Th>Due</Th><Th>Status</Th></tr></thead>
                <tbody className="divide-y divide-[#eef1f4]">
                  {invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <Td>
                        <p className="font-semibold text-[#2f3338]">{invoice.id}</p>
                        <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{invoice.plan}</p>
                      </Td>
                      <Td>
                        <p>{invoice.student}</p>
                        <p className="mt-0.5 text-[11px] text-[#9aa3ad]">{invoice.guardian}</p>
                      </Td>
                      <Td className="whitespace-nowrap font-semibold">{currency(invoice.amount)}</Td>
                      <Td className="whitespace-nowrap">{currency(invoice.paid)}</Td>
                      <Td className="whitespace-nowrap">{invoice.due}</Td>
                      <Td><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Fee plans" description="Attached to grade, programme and campus." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Plan</Th><Th>Applies to</Th><Th>Amount</Th><Th>Terms</Th><Th>Learners</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {feePlans.map(plan => (
                  <tr key={plan.name}>
                    <Td className="font-semibold text-[#2f3338]">{plan.name}</Td>
                    <Td>{plan.grades}</Td>
                    <Td className="whitespace-nowrap">{currency(plan.amount)}</Td>
                    <Td>{plan.installments}</Td>
                    <Td>{plan.uptake}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Scholarships & aid" description="Confidential awards and renewal dates.">
            <ul className="divide-y divide-[#eef1f4]">
              {scholarships.map(award => (
                <li key={award.name} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-[#2f3338]">{award.name}</p>
                      <p className="mt-0.5 text-[12px] text-[#6b7380]">{award.student} · {award.value}</p>
                    </div>
                    <Badge tone={statusTone(award.status)}>{award.status}</Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-[#9aa3ad]">{award.renewed}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Callout tone="warn" title="Segregation of duties is enforced.">
          Waivers, refunds and discounts above ₦20,000 require a second approver. The creator can never approve their own adjustment.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
