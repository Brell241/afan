'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Music2, PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/lib/player-context';
import { LikeButton } from '@/components/ui/LikeButton';
import { AddToPlaylistButton } from '@/components/ui/AddToPlaylistButton';
import type { Track, Album } from '@/db/schema';

interface TracklistProps {
  tracks: Track[];
  album: Album;
  artist: { name: string; slug: string };
  onOpenTrack?: (track: Track) => void;
}

function TrackThumbnail({ track, album }: { track: Track; album: Album }) {
  const [imageUrl, setImageUrl] = useState(track.image_url ?? album.image_url);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`/api/upload/track/${track.id}`, { method: 'PATCH', body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setImageUrl(url);
      toast.success('Image du titre mise à jour.');
    } catch {
      toast.error('Erreur upload.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="group/thumb relative w-10 h-10 rounded overflow-hidden shrink-0 bg-white/5 cursor-pointer"
      onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={track.title} fill sizes="40px" className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Music2 size={14} className="text-white/15" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
        {uploading ? (
          <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <Camera size={11} className="text-white" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function Tracklist({ tracks, album, artist, onOpenTrack }: TracklistProps) {
  const { play, track: activeTrack } = usePlayer();
  const playTrack = (track: Track) =>
    play(track, album, artist, tracks.map((t) => ({ track: t, album })));

  if (tracks.length === 0) {
    return (
      <div className="py-8 text-center text-white/30 text-sm">
        Aucun titre enregistré pour cet album. Tu peux contribuer ci-dessous.
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {tracks.map((track, idx) => {
        const isActive = activeTrack?.id === track.id;
        const hasYt = !!track.youtube_url;
        return (
          <div
            key={track.id}
            className={`flex items-center gap-4 py-2.5 px-3 group rounded-lg transition-colors cursor-default ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/5'}`}
          >
            {/* Numéro / play */}
            <div className="w-5 text-right shrink-0">
              {isActive ? (
                <span className="text-[#1DB954]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="inline">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
              ) : (
                <>
                  <span className="text-white/30 text-xs font-mono group-hover:hidden">
                    {track.track_number ?? idx + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track)}
                    className="hidden group-hover:block text-white"
                  >
                    {track.youtube_url ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Vignette */}
            <TrackThumbnail track={track} album={album} />

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-[#1DB954]' : hasYt ? 'text-white/90 group-hover:text-white' : 'text-white/35'}`}>
                {track.title}
              </p>
              {track.duration && (
                <span className="text-white/30 text-xs">{track.duration}</span>
              )}
            </div>

            {track.youtube_url ? (
              <button
                onClick={() => playTrack(track)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs hover:bg-[#1DB954]/20 transition-all opacity-0 group-hover:opacity-100"
              >
                ▶ Écouter
              </button>
            ) : (
              <span className="text-white/15 text-xs opacity-0 group-hover:opacity-100 shrink-0">
                lien manquant
              </span>
            )}

            <LikeButton
              type="track"
              id={track.id}
              size={14}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-all opacity-0 group-hover:opacity-100 data-[liked=true]:opacity-100 data-[liked=true]:text-[#e85d7e]"
            />

            <AddToPlaylistButton
              trackId={track.id}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-all opacity-0 group-hover:opacity-100"
            />

            {onOpenTrack && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenTrack(track); }}
                aria-label="Éditer ce titre"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.07] transition-all opacity-0 group-hover:opacity-100"
              >
                <PencilLine size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
