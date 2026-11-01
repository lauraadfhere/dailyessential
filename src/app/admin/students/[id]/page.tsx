import Link from 'next/link';
import { notFound } from 'next/navigation';
import ConsoleShell from '../../../../components/console-shell';
import { Badge, Callout, KeyValueGrid, PageFrame, Panel, Progress, StatGrid, statusTone, tableHead, Td, Th } from '../../../../components/platform/kit';
import { atlasStudents, attendanceTrend, counselingCases, courseCatalog, currency, invoices, studentDocuments } from '../../../../lib/atlas-data';

export default async function StudentRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = atlasStudents.find(item => item.id === id);
  if (!student) notFound();

  const learnerInvoices = invoices.filter(invoice => invoice.student === student.name);
  const cases = counselingCases.filter(item => item.student === student.name);
  const courses = courseCatalog.filter(course => course.section === student.className).slice(0, 4);
  const fallbackCourses = courses.length ? courses : courseCatalog.slice(0, 3);

  const timeline = [
    { at: '30 Oct 2026', title: 'Attendance register marked present', detail: `${student.className} · Period 3` },
    { at: '27 Oct 2026', title: 'Guardian contact confirmed', detail: `${student.guardian} · records office` },
    { at: '20 Oct 2026', title: 'Term 1 report acknowledged', detail: 'Signed by guardian in parent portal' },
    { at: student.joined, title: 'Enrolled at Daily Essential School', detail: `${student.campus} · ${student.programme}` },
  ];

  return (
    <ConsoleShell role="admin" showSidebar>
      <PageFrame
        eyebrow={`Student record · ${student.studentId}`}
        title={student.name}
        description={`${student.className} · ${student.programme} · ${student.campus}. Visible to authorised staff only; every edit is versioned.`}
        actions={
          <>
            <Link href="/admin/students" className="rounded border border-[#d8dde4] px-3 py-2 text-[13px] font-semibold text-[#4a515a] hover:bg-[#f5f7f9]">All learners</Link>
            <button type="button" className="rounded bg-[#2e9fff] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#1f8eef]">Edit record</button>
          </>
        }
      >
        <StatGrid
          items={[
            { label: 'Attendance', value: `${student.attendance}%`, detail: 'Term to date', tone: student.attendance < 85 ? 'warn' : undefined },
            { label: 'Average', value: String(student.average), detail: 'Weighted across courses' },
            { label: 'Fee balance', value: student.balance ? currency(student.balance) : 'Clear', detail: learnerInvoices.length ? `${learnerInvoices.length} invoice(s)` : 'No invoices', tone: student.balance ? 'danger' : undefined },
            { label: 'Risk level', value: student.risk, detail: student.supports.length ? student.supports.join(' · ') : 'No support plan', tone: student.risk === 'at-risk' ? 'danger' : student.risk === 'watch' ? 'warn' : undefined },
          ]}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Identity and enrolment">
            <KeyValueGrid
              items={[
                { label: 'Legal name', value: student.name },
                { label: 'Student ID', value: student.studentId },
                { label: 'Grade', value: student.grade },
                { label: 'Section', value: student.className },
                { label: 'Campus', value: student.campus },
                { label: 'Programme', value: student.programme },
                { label: 'Enrolled', value: student.joined },
                { label: 'Status', value: <Badge tone={statusTone(student.status)}>{student.status}</Badge> },
              ]}
            />
          </Panel>
          <Panel title="Guardian and contacts">
            <KeyValueGrid
              items={[
                { label: 'Primary guardian', value: student.guardian },
                { label: 'Guardian email', value: student.guardianEmail },
                { label: 'Portal access', value: 'Active · academic + finance' },
                { label: 'Emergency contact', value: `${student.guardian} · +234 80 •• •• 42` },
                { label: 'Authorised pick-up', value: '2 contacts on file' },
                { label: 'Communication language', value: 'English' },
              ]}
            />
            <div className="mt-4">
              <Callout tone="info" title="Privacy">
                Health, counselling and safeguarding details are stored separately and restricted to authorised staff.
              </Callout>
            </div>
          </Panel>
        </div>

        <Panel title="Academic progress" description={`Courses attached to ${student.className}.`}>
          <ul className="space-y-4">
            {fallbackCourses.map(course => (
              <li key={course.id} className="border-b border-[#f2f4f7] pb-3 last:border-0 last:pb-0">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-medium text-[#2f3338]">{course.title} <span className="font-normal text-[#9aa3ad]">· {course.code}</span></span>
                  <span className="text-[#6b7380]">{course.teacher}</span>
                </div>
                <Progress value={course.progress} tone={course.progress < 60 ? 'warn' : 'info'} label={`${course.completed} of ${course.lessons} lessons`} />
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Attendance pattern" description="Last teaching week.">
            <ul className="space-y-3">
              {attendanceTrend.map(day => (
                <li key={day.day} className="flex items-center gap-3 text-[13px]">
                  <span className="w-10 text-[#9aa3ad]">{day.day}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f2f4f7]">
                    <span className={`block h-full rounded-full ${day.rate < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${day.rate}%` }} />
                  </div>
                  <span className="w-9 text-right font-semibold text-[#2f3338]">{day.rate}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] text-[#6b7380]">Corrections after the lock period require a reason and approval.</p>
          </Panel>

          <Panel title="Finance" description="Invoices linked to this learner.">
            {learnerInvoices.length ? (
              <table className="min-w-full text-sm">
                <thead className={tableHead}>
                  <tr><Th>Invoice</Th><Th>Amount</Th><Th>Paid</Th><Th>Status</Th></tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f4]">
                  {learnerInvoices.map(invoice => (
                    <tr key={invoice.id}>
                      <Td>{invoice.id}<p className="mt-0.5 text-[11px] text-[#9aa3ad]">{invoice.plan}</p></Td>
                      <Td>{currency(invoice.amount)}</Td>
                      <Td>{currency(invoice.paid)}</Td>
                      <Td><Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-[13px] text-[#6b7380]">No invoices issued to this learner.</p>}
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Support and wellbeing" description="Restricted to authorised staff.">
            {cases.length ? cases.map(item => (
              <div key={item.id} className="mb-3 rounded border border-[#eef1f4] bg-[#f8f9fb] p-3.5 last:mb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-[#2f3338]">{item.concern}</p>
                  <Badge tone={statusTone(item.priority)}>{item.priority} priority</Badge>
                </div>
                <p className="mt-1.5 text-[12px] text-[#6b7380]">{item.stage} · next appointment {item.next}</p>
              </div>
            )) : <p className="text-[13px] text-[#6b7380]">No open counselling cases. Support flags: {student.supports.length ? student.supports.join(', ') : 'none'}.</p>}
          </Panel>

          <Panel title="Documents" description="Verified files with expiry tracking.">
            <ul className="divide-y divide-[#eef1f4]">
              {studentDocuments.map(document => (
                <li key={document.name} className="flex items-center justify-between gap-3 py-2.5 text-[13px] first:pt-0 last:pb-0">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[#2f3338]">{document.name}</span>
                    <span className="block text-[11px] text-[#9aa3ad]">{document.type} · {document.updated}</span>
                  </span>
                  <Badge tone={statusTone(document.status)}>{document.status}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Record timeline" description="Most recent events first.">
          <ol className="relative space-y-4 border-l border-[#eef1f4] pl-5">
            {timeline.map(item => (
              <li key={item.title} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#2e9fff]" />
                <p className="text-[13px] font-semibold text-[#2f3338]">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-[#6b7380]">{item.at} · {item.detail}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </PageFrame>
    </ConsoleShell>
  );
}
