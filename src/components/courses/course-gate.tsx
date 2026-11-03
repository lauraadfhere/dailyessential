import type { ReactElement, ReactNode } from 'react';
import { getServerSession } from '../../lib/auth-server';
import LoginRedirect from './login-redirect';

/**
 * Call at the very top of a protected page, before building any JSX:
 *
 *   const blocked = await courseGuard();
 *   if (blocked) return blocked;
 *
 * The page body is never produced for a visitor without a valid session, so none of its
 * data reaches the HTML or the streamed server payload. (A layout alone is not enough: the
 * page still renders and is streamed alongside it.)
 */
export async function courseGuard(): Promise<ReactElement | null> {
  const session = await getServerSession();
  return session ? null : <LoginRedirect />;
}

/** Layout-level backstop for routes whose pages also call courseGuard(). */
export default async function CourseGate({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) return <LoginRedirect />;
  return <>{children}</>;
}
