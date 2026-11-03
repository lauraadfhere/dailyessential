'use client';

import ConsoleShell from '../../../components/console-shell';
import MessagesPanel from '../../../components/courses/messages-panel';
import { PageFrame } from '../../../components/platform/kit';

export default function TeacherMessagesPage() {
  return (
    <ConsoleShell role="teacher" showSidebar>
      <PageFrame
        eyebrow="Communication"
        title="Messages"
        description="Questions from learners and reports about marks. Reply here; the learner is notified. Everything is kept on record."
      >
        <MessagesPanel mode="staff" />
      </PageFrame>
    </ConsoleShell>
  );
}
