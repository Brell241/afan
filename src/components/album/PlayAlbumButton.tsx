'use client';

import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/lib/player-context';
import type { Track, Album } from '@/db/schema';

interface PlayAlbumButtonProps {
  tracks: Track[];
  album: Album;
  artist: { name: string; slug: string };
}

export function PlayAlbumButton({ tracks, album, artist }: PlayAlbumButtonProps) {
  const { play, album: activeAlbum, isPlaying, togglePlay } = usePlayer();

  const isThisAlbum = activeAlbum?.id === album.id;
  const playableTracks = tracks.filter((t) => t.youtube_url);

  if (playableTracks.length === 0) return null;

  function handleClick() {
    if (isThisAlbum) {
      togglePlay();
      return;
    }
    const first = playableTracks[0];
    play(first, album, artist, tracks.map((t) => ({ track: t, album })));
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isThisAlbum && isPlaying ? 'Pause' : `Écouter ${album.title}`}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
    >
      {isThisAlbum && isPlaying ? (
        <Pause size={15} fill="currentColor" />
      ) : (
        <Play size={15} fill="currentColor" className="ml-0.5" />
      )}
      {isThisAlbum && isPlaying ? 'En écoute' : "Écouter l'album"}
    </button>
  );
}
