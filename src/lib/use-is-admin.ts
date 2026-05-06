'use client';

import { useSession } from '@/lib/auth-client';

export function useIsAdmin() {
  const { data: session } = useSession();
  return (session?.user as { role?: string } | undefined)?.role === 'admin';
}
