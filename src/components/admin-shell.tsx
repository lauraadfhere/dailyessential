'use client';

import type { ReactNode } from 'react';
import ConsoleShell from './console-shell';

/** @deprecated Prefer ConsoleShell role="admin" — kept for existing admin page imports. */
export default function AdminShell({
  children,
  showSidebar = false,
  greeting,
}: {
  children: ReactNode;
  showSidebar?: boolean;
  greeting?: string;
  settingsHref?: string;
}) {
  return (
    <ConsoleShell role="admin" showSidebar={showSidebar} greeting={greeting}>
      {children}
    </ConsoleShell>
  );
}
