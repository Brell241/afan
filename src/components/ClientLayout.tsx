'use client';

import type { ReactNode } from 'react';
import { PlayerProvider, usePlayer } from '@/lib/player-context';
import { PlayerBar } from '@/components/player/PlayerBar';

function ContentWrapper({ children }: { children: ReactNode }) {
  const { track } = usePlayer();
  return (
    <div className={track ? 'pb-[72px]' : ''}>
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
