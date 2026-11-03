import { courseGuard } from '../../../components/courses/course-gate';
import MessagesPanel from '../../../components/courses/messages-panel';
import PortalShell from '../../../components/portal-shell';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Messages', robots: { index: false, follow: false } };

export default async function StudentMessagesPage() {
  const blocked = await courseGuard();
  if (blocked) return blocked;
  return (
    <PortalShell role="student">
      <section className="mb-5 border-b border-slate-300 pb-5">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Student space / Messages</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Messages with your teachers</h2>
        <p className="mt-1 text-sm text-slate-500">Ask a question or report a mark you think is wrong. Teachers reply here and you get a notification.</p>
      </section>
      <MessagesPanel mode="student" />
    </PortalShell>
  );
}
