'use client';

import ConsoleShell from '../../../components/console-shell';
import StaffProfile from '../../../components/staff-profile';

export default function TeacherProfilePage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <StaffProfile />
    </ConsoleShell>
  );
}
