'use client';

import { useState } from 'react';
import ConsoleShell from '../../../components/console-shell';
import FilterTabs, { SearchField } from '../../../components/platform/filter-tabs';
import { Badge, EmptyNote, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { bookLoans, libraryCatalog } from '../../../lib/atlas-data';

export default function AdminLibraryPage() {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  const types = Array.from(new Set(libraryCatalog.map(item => item.type)));
  const visible = libraryCatalog.filter(item => {
    const typeMatch = tab === 'all' || item.type === tab;
    const text = `${item.title} ${item.author} ${item.subject}`.toLowerCase();
    return typeMatch && text.includes(query.trim().toLowerCase());
  });

  const onLoan = libraryCatalog.reduce((total, item) => total + (item.copies - item.available), 0);
  const overdue = bookLoans.filter(loan => loan.status === 'overdue').length;

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Resources"
        title="Library"
        description="Catalogue, loans and reading lists. Digital items are available at any time; physical copies are tracked per learner."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Scan ISBN</button>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Add title</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Titles', value: String(libraryCatalog.length), detail: 'Books, workbooks and licensed PDFs' },
            { label: 'Copies on loan', value: String(onLoan), detail: 'Physical copies currently issued' },
            { label: 'Overdue', value: String(overdue), detail: 'Fines applied automatically', tone: overdue ? 'danger' : undefined },
            { label: 'Reservations', value: '3', detail: 'Two learners waiting for Design titles' },
          ]}
        />

        <Panel className="overflow-hidden" bodyClassName="p-0">
          <div className="flex flex-col gap-3 px-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#2f3338]">Catalogue</h2>
              <p className="mt-1 text-[13px] text-[#6b7380]">Availability updates as copies are issued and returned.</p>
            </div>
            <SearchField value={query} onChange={setQuery} placeholder="Search title, author or subject…" />
          </div>
          <FilterTabs
            tabs={[{ id: 'all', label: 'All', count: libraryCatalog.length }, ...types.map(type => ({ id: type, label: type, count: libraryCatalog.filter(item => item.type === type).length }))]}
            value={tab}
            onChange={setTab}
            className="mt-3 px-2"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Title</Th><Th>Author</Th><Th>Subject</Th><Th>Type</Th><Th>Copies</Th><Th>Availability</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {visible.map(item => (
                  <tr key={item.id}>
                    <Td className="font-semibold text-[#2f3338]">{item.title}</Td>
                    <Td>{item.author}</Td>
                    <Td>{item.subject}</Td>
                    <Td>{item.type}</Td>
                    <Td>{item.copies >= 999 ? 'Unlimited' : item.copies}</Td>
                    <Td>
                      <Badge tone={item.available === 0 ? 'danger' : item.available <= 2 ? 'warn' : 'success'}>
                        {item.available >= 999 ? 'digital' : `${item.available} available`}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && <EmptyNote>No titles match this search.</EmptyNote>}
        </Panel>

        <Panel title="Loans" description="Due dates, renewals and overdue handling." className="overflow-hidden" bodyClassName="p-0">
          <table className="min-w-full text-sm">
            <thead className={tableHead}><tr><Th>Title</Th><Th>Borrower</Th><Th>Due</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
            <tbody className="divide-y divide-[#eef1f4]">
              {bookLoans.map(loan => (
                <tr key={loan.id}>
                  <Td className="font-semibold text-[#2f3338]">{loan.title}</Td>
                  <Td>{loan.borrower}</Td>
                  <Td className="whitespace-nowrap">{loan.due}</Td>
                  <Td><Badge tone={statusTone(loan.status)}>{loan.status}</Badge></Td>
                  <Td className="text-right">
                    <button type="button" className="rounded border border-[#d8dde4] px-2.5 py-1.5 text-[11px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Renew</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </PageFrame>
    </ConsoleShell>
  );
}
