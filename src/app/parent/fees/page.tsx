'use client';

import { useState } from 'react';
import PortalShell from '../../../components/portal-shell';
import { Badge, Callout, KeyValueGrid, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { currency, invoices, parentChildren } from '../../../lib/atlas-data';

type LocalInvoice = (typeof invoices)[number];

export default function ParentFeesPage() {
  const [childId, setChildId] = useState(parentChildren[0].id);
  const child = parentChildren.find(item => item.id === childId) || parentChildren[0];
  const [rows, setRows] = useState<LocalInvoice[]>(invoices);
  const [method, setMethod] = useState('Card');
  const [paid, setPaid] = useState<string | null>(null);

  const familyInvoices = rows.filter(row => row.student === child.name);
  const outstanding = familyInvoices.reduce((total, row) => total + (row.amount - row.paid), 0);

  const pay = (invoice: LocalInvoice) => {
    setRows(current => current.map(row => row.id === invoice.id ? { ...row, paid: row.amount, status: 'paid' } : row));
    setPaid(invoice.id);
  };

  return (
    <PortalShell role="parent">
      <PageFrame
        variant="portal"
        eyebrow="Family portal"
        title="Fees & payments"
        description="Invoices, instalments and receipts for your family. Card and transfer payments are reconciled automatically."
        actions={<button type="button" className="rounded border border-[#1738a8] px-3 py-2 text-[13px] font-semibold text-[#1738a8] hover:bg-[#e8eefc]">Download statement</button>}
      >
        <div className="flex flex-wrap gap-2">
          {parentChildren.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setChildId(item.id); setPaid(null); }}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${item.id === childId ? 'border-[#1738a8] bg-[#1738a8] text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-[#1738a8]'}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {paid && (
          <div className="rounded border-l-4 border-emerald-500 bg-emerald-50/70 px-4 py-3 text-[13px] text-slate-700">
            <p className="font-semibold text-slate-800">Payment received — receipt {paid}</p>
            <p className="mt-0.5">A receipt has been emailed and added to your documents. Thank you.</p>
          </div>
        )}

        <StatGrid
          items={[
            { label: 'Outstanding', value: outstanding ? currency(outstanding) : 'Clear', detail: outstanding ? 'Next due date 30 Nov 2026' : 'No balance for this child', tone: outstanding ? 'danger' : 'success' },
            { label: 'Invoices', value: String(familyInvoices.length), detail: 'Current academic year' },
            { label: 'Paid to date', value: currency(familyInvoices.reduce((total, row) => total + row.paid, 0)), detail: 'Reconciled payments' },
            { label: 'Payment plan', value: '3 instalments', detail: 'Sibling discount applied' },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Invoices" description={`${child.name} · ${child.className}`} className="overflow-hidden" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={tableHead}><tr><Th>Invoice</Th><Th>Amount</Th><Th>Paid</Th><Th>Due</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {familyInvoices.map(invoice => {
                    const due = invoice.amount - invoice.paid;
                    return (
                      <tr key={invoice.id}>
                        <Td>
                          <p className="font-semibold text-[#15133d]">{invoice.id}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{invoice.plan}</p>
                        </Td>
                        <Td className="whitespace-nowrap">{currency(invoice.amount)}</Td>
                        <Td className="whitespace-nowrap">{currency(invoice.paid)}</Td>
                        <Td className="whitespace-nowrap">{invoice.due}</Td>
                        <Td><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></Td>
                        <Td className="text-right">
                          {due > 0 ? (
                            <button type="button" onClick={() => pay(invoice)} className="rounded bg-[#1738a8] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#102d88]">Pay {currency(due)}</button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Settled</span>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                  {!familyInvoices.length && <tr><Td className="text-slate-500">No invoices for this child.</Td><Td>—</Td><Td>—</Td><Td>—</Td><Td>—</Td><Td>—</Td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Payment method" description="Choose how you want to pay.">
              <div className="space-y-2">
                {['Card', 'Bank transfer', 'USSD'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMethod(option)}
                    className={`flex w-full items-center justify-between rounded border px-3 py-2.5 text-[13px] font-semibold transition ${method === option ? 'border-[#1738a8] bg-[#f4f7ff] text-[#1738a8]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {option}
                    <span className={`h-3.5 w-3.5 rounded-full border ${method === option ? 'border-[#1738a8] bg-[#1738a8]' : 'border-slate-300'}`} />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">Payments are verified server-side. The school never sees or stores your card details.</p>
            </Panel>
            <Panel title="Plan details">
              <KeyValueGrid
                items={[
                  { label: 'Plan', value: 'Termly tuition' },
                  { label: 'Instalments', value: '3 per year' },
                  { label: 'Sibling discount', value: '5% applied' },
                  { label: 'Late fee', value: 'None on this plan' },
                ]}
              />
            </Panel>
          </div>
        </div>

        <Panel title="Receipts" description="Every successful payment is kept here." className="overflow-hidden" bodyClassName="p-0">
          <table className="min-w-full text-sm">
            <thead className={tableHead}><tr><Th>Receipt</Th><Th>Invoice</Th><Th>Amount</Th><Th>Method</Th><Th className="text-right">Document</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.filter(row => row.paid > 0 && parentChildren.some(child => child.name === row.student)).map(row => (
                <tr key={row.id}>
                  <Td className="font-semibold text-[#15133d]">RCP-{row.id.split('-')[1]}</Td>
                  <Td>{row.id}</Td>
                  <Td>{currency(row.paid)}</Td>
                  <Td>Card · verified</Td>
                  <Td className="text-right"><button type="button" className="text-[12px] font-bold text-[#1738a8] hover:underline">Download PDF</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Callout tone="warn" title="Need more time? Ask before the due date.">
          Confidential payment plans are available. Contact the finance office and a plan can be agreed without affecting your child’s access to learning.
        </Callout>
      </PageFrame>
    </PortalShell>
  );
}
