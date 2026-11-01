'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  avatarFallback,
  readPortalIdentity,
  syncPortalProfile,
  type PortalIdentity,
} from '../lib/portal-session';

const defaultIdentity = (role?: string): PortalIdentity => ({
  email: '',
  displayName: '',
  role: role || '',
  avatarUrl: '',
  status: 'active',
  studentId: '',
  programme: '',
  classGroup: '',
  gradeLevel: '',
  campus: '',
});

export function usePortalIdentity(role?: string) {
  const [identity, setIdentity] = useState<PortalIdentity>(() => ({
    ...defaultIdentity(role),
    ...readPortalIdentity(),
  }));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await syncPortalProfile(undefined, role);
      setIdentity(next);
      return next;
    } catch {
      const cached = readPortalIdentity();
      const fallbackName = cached.displayName || cached.email || 'Daily Essential Learner';
      const next = {
        ...defaultIdentity(role),
        ...cached,
        avatarUrl: cached.avatarUrl || avatarFallback(fallbackName),
        status: cached.status || 'active',
      };
      setIdentity(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { identity, loading, refresh, avatarUrl: identity.avatarUrl || avatarFallback(identity.displayName || 'Daily Essential') };
}
