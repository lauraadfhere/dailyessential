'use client';

import ConsoleShell from '../../../components/console-shell';
import StaffAssignments from '../../../components/courses/staff-assignments';

export default function ExaminerAssignmentsPage() {
  return (
    <ConsoleShell role="examiner" showSidebar>
      <StaffAssignments />
    </ConsoleShell>
  );
}
