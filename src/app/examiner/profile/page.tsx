'use client';

import ConsoleShell from '../../../components/console-shell';
import StaffProfile from '../../../components/staff-profile';

export default function ExaminerProfilePage() {
  return (
    <ConsoleShell role="examiner" showSidebar>
      <StaffProfile />
    </ConsoleShell>
  );
}
