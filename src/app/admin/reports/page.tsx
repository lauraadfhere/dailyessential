import ConsoleShell from '../../../components/console-shell';
import { Badge, Callout, PageFrame, Panel, StatGrid, statusTone, tableHead, Td, Th } from '../../../components/platform/kit';
import { reportLibrary, scheduledReports } from '../../../lib/atlas-data';

export default function AdminReportsPage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow="Reporting & analytics"
        title="Reports"
        description="Prebuilt reports, scheduled delivery and a scoped builder. Row-level security applies to every export, not just the screen."
        actions={
          <>
            <button type="button" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">Import template</button>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">New report</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Report library', value: String(reportLibrary.length), detail: 'Attendance, academic, finance and more' },
            { label: 'Scheduled', value: String(scheduledReports.length), detail: 'Next delivery 30 Oct · 16:00' },
            { label: 'Statutory returns', value: '1 due', detail: 'Ministry attendance return · 1 Dec', tone: 'warn' },
            { label: 'Data freshness', value: '4 min', detail: 'Warehouse sync completed 09:38' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reportLibrary.map(report => (
            <article key={report.name} className="flex flex-col rounded-lg border border-[#e1e5eb] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[14px] font-semibold text-[#2f3338]">{report.name}</h2>
                <Badge tone="brand">{report.category}</Badge>
              </div>
              <p className="mt-2 flex-1 text-[12px] leading-5 text-[#6b7380]">{report.description}</p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f2f4f7] pt-3">
                <span className="text-[11px] text-[#9aa3ad]">{report.schedule}</span>
                <button type="button" className="text-[12px] font-semibold text-[#2e9fff] hover:underline">Run →</button>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Panel title="Scheduled delivery" description="Reports are generated in the background and delivered by signed link." className="overflow-hidden" bodyClassName="p-0">
            <table className="min-w-full text-sm">
              <thead className={tableHead}><tr><Th>Report</Th><Th>Recipients</Th><Th>Next run</Th><Th>Format</Th></tr></thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {scheduledReports.map(report => (
                  <tr key={report.name}>
                    <Td className="font-semibold text-[#2f3338]">{report.name}</Td>
                    <Td>{report.recipients}</Td>
                    <Td className="whitespace-nowrap">{report.next}</Td>
                    <Td>{report.format}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Report builder" description="Choose an entity, then narrow with filters.">
            <div className="space-y-3 text-[13px]">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">Entity</span>
                <select className="mt-1.5 w-full rounded border border-[#d8dde4] bg-white px-3 py-2 text-[13px] text-[#2f3338] outline-none">
                  <option>Students</option>
                  <option>Attendance</option>
                  <option>Assessments</option>
                  <option>Invoices</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">Filters</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {['Term 1', 'JSS 2 Blue', 'Attendance < 90%'].map(filter => (
                    <span key={filter} className="rounded-full bg-[#eaf6ff] px-2.5 py-1 text-[11px] font-semibold text-[#1372b8]">{filter}</span>
                  ))}
                  <button type="button" className="rounded-full border border-dashed border-[#c0c6ce] px-2.5 py-1 text-[11px] font-semibold text-[#6b7380]">+ Add filter</button>
                </div>
              </label>
              <div className="rounded border border-[#eef1f4] bg-[#f8f9fb] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9aa3ad]">Preview columns</p>
                <p className="mt-1.5 text-[12px] text-[#4a515a]">Learner · Section · Guardian · Attendance % · Average · Fee balance</p>
              </div>
              <button type="button" className="w-full rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Preview report</button>
            </div>
          </Panel>
        </div>

        <Callout tone="info" title="Exports are permission-checked and audited.">
          Every generated report records the requester, the filters used, the row count and the download link, so personal-data exports can be reviewed.
        </Callout>
      </PageFrame>
    </ConsoleShell>
  );
}
