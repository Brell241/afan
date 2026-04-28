'use client';

import type { ReactNode } from 'react';
import { PlayerProvider, usePlayer } from '@/lib/player-context';
import { PlayerBar } from '@/components/player/PlayerBar';

function ContentWrapper({ children }: { children: ReactNode }) {
  const { track } = usePlayer();
  return (
    <div style={track ? { paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' } : {}}>
      {children}
    </div>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <ContentWrapper>{children}</ContentWrapper>
      <PlayerBar />
    </PlayerProvider>
  );
}
