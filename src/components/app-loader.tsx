'use client';

import { useEffect, useRef, useState } from 'react';

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const showBriefly = () => {
      setVisible(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 500);
    };
    showBriefly();
    const startNavigation = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor || event.defaultPrevented || anchor.target === '_blank') return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname !== window.location.pathname) showBriefly();
    };
    window.addEventListener('click', startNavigation, true);
    return () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); window.removeEventListener('click', startNavigation, true); };
  }, []);

  return <>
    {visible && <div className="fixed inset-0 z-[100] grid place-items-center bg-white" role="status" aria-label="Loading Daily Essential School">
      <div className="text-center"><div className="bifti-grid-loader mx-auto" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
    </div>}
    {children}
  </>;
}
