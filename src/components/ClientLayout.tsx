'use client';

import type { ReactNode } from 'react';
import { PlayerProvider, usePlayer } from '@/lib/player-context';
import { SearchProvider, useSearch } from '@/lib/search-context';
import { PlayerBar } from '@/components/player/PlayerBar';
import { GlobalSearch } from '@/components/GlobalSearch';

function Inner({ children }: { children: ReactNode }) {
  const { track } = usePlayer();
  const { isOpen, close } = useSearch();

  return (
    <>
      <div style={track ? { paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' } : {}}>
        {children}
      </div>
      <GlobalSearch isOpen={isOpen} onClose={close} />
    </>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <PlayerProvider>
        <Inner>{children}</Inner>
        <PlayerBar />
      </PlayerProvider>
    </SearchProvider>
  );
}
