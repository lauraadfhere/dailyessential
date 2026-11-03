import { courseGuard } from '../../../components/courses/course-gate';
import PortalShell from '../../../components/portal-shell';
import StudentCoursesView from '../../../components/courses/student-courses-view';

export default async function StudentCoursesPage() {
  const blocked = await courseGuard();
  if (blocked) return blocked;
  return (
    <PortalShell role="student">
      <StudentCoursesView />
    </PortalShell>
  );
}
