'use client';

import { useState } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { usePlayer } from '@/lib/player-context';
import type { QueueEntry } from '@/lib/player-context';

interface PlayAllButtonProps {
  artistSlug: string;
  artistName: string;
}

export function PlayAllButton({ artistSlug, artistName }: PlayAllButtonProps) {
  const { playAll, artist: activeArtist, isPlaying, togglePlay } = usePlayer();
  const [loading, setLoading] = useState(false);

  const isThisArtist = activeArtist?.slug === artistSlug;

  async function handleClick() {
    if (isThisArtist) {
      togglePlay();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/artist/${artistSlug}/tracks`);
      const data = await res.json();
      const entries: QueueEntry[] = data.entries ?? [];
      if (entries.length > 0) {
        playAll(entries, { name: artistName, slug: artistSlug });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={isThisArtist && isPlaying ? 'Pause' : `Écouter toute la discographie de ${artistName}`}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100 shadow-lg"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : isThisArtist && isPlaying ? (
        <Pause size={15} fill="currentColor" />
      ) : (
        <Play size={15} fill="currentColor" className="ml-0.5" />
      )}
      {isThisArtist && isPlaying ? 'En écoute' : 'Tout écouter'}
    </button>
  );
}
