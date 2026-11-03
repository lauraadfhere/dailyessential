'use client';

import ConsoleShell from '../../../components/console-shell';
import StaffAssignments from '../../../components/courses/staff-assignments';

export default function AdminAssignmentsPage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <StaffAssignments />
    </ConsoleShell>
  );
}
