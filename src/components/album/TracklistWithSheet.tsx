'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tracklist } from './Tracklist';
import { TrackSheet } from './TrackSheet';
import type { Track, Album } from '@/db/schema';

interface TracklistWithSheetProps {
  tracks: Track[];
  album: Album;
  artist: { name: string; slug: string };
  likeCounts?: Record<string, number>;
}

export function TracklistWithSheet({ tracks, album, artist, likeCounts }: TracklistWithSheetProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const router = useRouter();

  /* Toujours résoudre depuis la prop `tracks` pour avoir les données fraîches après refresh */
  const selectedTrack = selectedTrackId
    ? (tracks.find((t) => t.id === selectedTrackId) ?? null)
    : null;

  function onSaved() {
    router.refresh();
  }

  return (
    <>
      <Tracklist
        tracks={tracks}
        album={album}
        artist={artist}
        onOpenTrack={(track) => setSelectedTrackId(track.id)}
        likeCounts={likeCounts}
      />
      <TrackSheet
        track={selectedTrack}
        tracks={tracks}
        album={album}
        artist={artist}
        onClose={() => setSelectedTrackId(null)}
        onSaved={onSaved}
      />
    </>
  );
}
