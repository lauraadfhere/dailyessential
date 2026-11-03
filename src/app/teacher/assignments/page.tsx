'use client';

import ConsoleShell from '../../../components/console-shell';
import StaffAssignments from '../../../components/courses/staff-assignments';

export default function TeacherAssignmentsPage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <StaffAssignments />
    </ConsoleShell>
  );
}
