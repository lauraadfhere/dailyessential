'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { readPortalIdentity } from '../../lib/portal-session';
import { homeForRole, loginForRole } from '../../lib/role-routing';

/**
 * Smart entry point for "School portal".
 *
 * Signed-in visitors land on their own dashboard; visitors who are not signed
 * in are sent to the sign-in screen that matches the last role they used.
 */
export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Opening the school portal…');

  useEffect(() => {
    let destination = '/login/student';
    try {
      const identity = readPortalIdentity();
      if (identity.email && identity.role) {
        destination = homeForRole(identity.role);
        setMessage(`Welcome back — opening ${identity.displayName || identity.email}…`);
      } else if (identity.role) {
        destination = loginForRole(identity.role);
      }
    } catch {
      /* storage blocked: keep the default student login */
    }
    router.replace(destination);
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#1738a8] px-6 text-white">
      <div className="text-center">
        <p className="text-sm font-semibold text-white/80">{message}</p>
        <a href="/login/student" className="mt-3 inline-block text-xs underline">Continue to sign in</a>
      </div>
    </main>
  );
}
