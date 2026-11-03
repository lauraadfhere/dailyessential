'use client';

import { useEffect } from 'react';
import { clearPortalIdentity } from '../../lib/portal-session';

/**
 * Shown instead of protected content when the server found no valid session.
 * It clears any stale browser identity (otherwise the login form would bounce
 * straight back here) and sends the visitor to sign in, returning to this page after.
 */
export default function LoginRedirect() {
  const target = () => {
    const next = `${window.location.pathname}${window.location.search}`;
    return `/login/student?next=${encodeURIComponent(next)}`;
  };

  useEffect(() => {
    clearPortalIdentity();
    window.location.replace(target());
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#1738a8] px-6 text-white">
      <div className="max-w-sm text-center">
        <p className="text-lg font-bold">Sign in to open courses</p>
        <p className="mt-2 text-sm text-white/80">Courses are available to signed-in learners and staff. Redirecting you to the sign-in page…</p>
        <button type="button" onClick={() => window.location.assign(target())} className="mt-5 inline-block bg-white px-4 py-2 text-sm font-bold text-[#1738a8]">
          Continue to sign in
        </button>
      </div>
    </main>
  );
}
