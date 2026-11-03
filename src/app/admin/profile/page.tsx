'use client';

import ConsoleShell from '../../../components/console-shell';
import StaffProfile from '../../../components/staff-profile';

export default function AdminProfilePage() {
  return (
    <ConsoleShell role="admin" showSidebar>
      <StaffProfile />
    </ConsoleShell>
  );
}
