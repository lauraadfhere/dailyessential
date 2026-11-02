'use client';

import { useEffect } from 'react';
import { currentStudent } from './enrolment';

/**
 * Counts time while a course page is open and visible, then saves it to the
 * student's enrolment in whole-minute steps. Nothing is saved for hidden tabs.
 */
export default function TimeTracker({ courseSlug }: { courseSlug: string }) {
  useEffect(() => {
    let visibleMs = 0;
    let since: number | null = document.visibilityState === 'visible' ? Date.now() : null;

    const tick = () => {
      if (since !== null) {
        visibleMs += Date.now() - since;
        since = Date.now();
      }
    };

    const flush = () => {
      tick();
      const minutes = Math.floor(visibleMs / 60000);
      if (minutes < 1) return;
      visibleMs -= minutes * 60000;
      const student = currentStudent();
      // keepalive lets the request finish when the page is being closed.
      fetch('/api/enrollments', {
        method: 'PATCH',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: student.email, courseSlug, action: 'time', minutes }),
      }).catch(() => undefined);
    };

    const onVisibility = () => {
      tick();
      if (document.visibilityState === 'visible') since = Date.now();
      else {
        since = null;
        flush();
      }
    };

    const timer = window.setInterval(flush, 60000);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [courseSlug]);

  return null;
}
