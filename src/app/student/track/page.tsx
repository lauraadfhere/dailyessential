import { courseGuard } from '../../../components/courses/course-gate';
import PortalShell from '../../../components/portal-shell';
import TrackView from '../../../components/courses/track-view';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Track my progress', robots: { index: false, follow: false } };

export default async function StudentTrackPage() {
  const blocked = await courseGuard();
  if (blocked) return blocked;
  return (
    <PortalShell role="student">
      <TrackView />
    </PortalShell>
  );
}
