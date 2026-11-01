import PortalShell from '../../../components/portal-shell';
import StudentCoursesView from '../../../components/courses/student-courses-view';

export default function StudentCoursesPage() {
  return (
    <PortalShell role="student">
      <StudentCoursesView />
    </PortalShell>
  );
}
