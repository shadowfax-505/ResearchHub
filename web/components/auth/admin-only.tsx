'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredSessionRole, hasStoredSession } from '@/lib/session';

export function AdminOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const role = getStoredSessionRole();
    if (role !== 'admin') {
      router.replace(hasStoredSession() ? '/feed' : '/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="grid min-h-[40vh] place-items-center text-sm font-bold text-muted dark:text-darkMuted">Checking admin access…</div>;
  }

  return <>{children}</>;
}
