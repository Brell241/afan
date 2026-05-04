'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ListMusic, Play, Trash2, Music2, X, LogIn } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useLibrary } from '@/lib/library-context';
import { usePlayer } from '@/lib/player-context';
import type { QueueEntry } from '@/lib/player-context';

interface PlaylistData {
  playlist: { id: string; name: string; created_at: string | null };
  entries: QueueEntry[];
}

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { removeFromPlaylist, deletePlaylist, showAuthModal, playlists } = useLibrary();
  const { play, playAll } = usePlayer();

  const [data, setData] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!session?.user) return;
    load();
  }, [session?.user, load]);

  async function handleRemove(trackId: string) {
    if (!data) return;
    await removeFromPlaylist(id, trackId);
    setData((prev) =>
      prev ? { ...prev, entries: prev.entries.filter((e) => e.track.id !== trackId) } : prev
    );
  }

  function handlePlayAll() {
    if (!data?.entries.length) return;
    const firstArtist = data.entries[0].artist ?? { name: '', slug: '' };
    playAll(data.entries, firstArtist);
  }

  function handlePlayTrack(entry: QueueEntry) {
    if (!entry.track.youtube_url) return;
    play(
      entry.track,
      entry.album,
      entry.artist ?? { name: '', slug: '' },
      data?.entries ?? [entry]
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <ListMusic size={36} className="text-white/10" />
        <p className="text-white/40 text-sm">Connecte-toi pour accéder à tes playlists.</p>
        <button
          onClick={showAuthModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform"
        >
          <LogIn size={14} />
          Se connecter
        </button>
      </div>
    );
  }

  const playlistMeta = playlists.find((p) => p.id === id);
  const name = data?.playlist.name ?? playlistMeta?.name ?? '…';
  const entries = data?.entries ?? [];
  const playableCount = entries.filter((e) => e.track.youtube_url).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-20 pb-24">

        {/* Retour */}
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-white/35 hover:text-white/70 text-xs mb-8 transition-colors"
        >
          <ArrowLeft size={13} />
          Ma musique
        </Link>

        {/* En-tête */}
        <div className="flex items-start gap-5 mb-10">
          <div className="w-20 h-20 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
            <ListMusic size={28} className="text-white/20" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-1">Playlist</p>
            <h1 className="text-white font-black text-3xl tracking-tight truncate">{name}</h1>
            {!loading && (
              <p className="text-white/30 text-sm mt-1">
                {entries.length} titre{entries.length !== 1 ? 's' : ''}
                {playableCount < entries.length && entries.length > 0 && (
                  <span className="text-white/20"> · {playableCount} lisible{playableCount !== 1 ? 's' : ''}</span>
                )}
              </p>
            )}
          </div>
          {playableCount > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform shrink-0"
            >
              <Play size={13} fill="currentColor" />
              Tout lire
            </button>
          )}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-white/30 text-sm">Impossible de charger la playlist.</p>
            <button onClick={load} className="mt-3 text-white/40 hover:text-white/70 text-xs underline">
              Réessayer
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <Music2 size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">Cette playlist est vide.</p>
            <p className="text-white/20 text-xs mt-1">
              Ajoute des titres depuis la tracklist d&apos;un album.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {entries.map(({ track, album, artist }, idx) => {
              const hasYt = !!track.youtube_url;
              const imgSrc = track.image_url ?? album.image_url;
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 py-2.5 px-3 group rounded-lg transition-colors ${hasYt ? 'hover:bg-white/[0.04] cursor-default' : 'cursor-default'}`}
                >
                  {/* Numéro */}
                  <div className={`w-5 text-right shrink-0 ${!hasYt ? 'opacity-40' : ''}`}>
                    <span className="text-white/30 text-xs font-mono group-hover:hidden">
                      {track.track_number ?? idx + 1}
                    </span>
                    {hasYt ? (
                      <button
                        onClick={() => handlePlayTrack({ track, album, artist })}
                        className="hidden group-hover:block text-white"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                    ) : (
                      <span className="hidden group-hover:block text-white/20 text-xs">—</span>
                    )}
                  </div>

                  {/* Vignette */}
                  <div className={`relative w-10 h-10 rounded shrink-0 bg-white/5 overflow-hidden ${!hasYt ? 'opacity-40' : ''}`}>
                    {imgSrc ? (
                      <Image src={imgSrc} alt={track.title} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 size={14} className="text-white/15" />
                      </div>
                    )}
                  </div>

                  {/* Titre + artiste */}
                  <div className={`flex-1 min-w-0 ${!hasYt ? 'opacity-40' : ''}`}>
                    <p className="text-white/90 text-sm font-medium truncate">{track.title}</p>
                    {artist && (
                      <p className="text-white/35 text-xs truncate">
                        <Link href={`/artist/${artist.slug}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          {artist.name}
                        </Link>
                        {' · '}
                        <Link href={`/artist/${artist.slug}/album/${album.slug}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          {album.title}
                        </Link>
                      </p>
                    )}
                  </div>

                  {/* Durée */}
                  {track.duration && (
                    <span className={`text-white/25 text-xs font-mono shrink-0 ${!hasYt ? 'opacity-40' : ''}`}>
                      {track.duration}
                    </span>
                  )}

                  {/* Bouton écouter */}
                  {hasYt && (
                    <button
                      onClick={() => handlePlayTrack({ track, album, artist })}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs hover:bg-[#1DB954]/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      ▶ Écouter
                    </button>
                  )}

                  {/* Retirer */}
                  <button
                    onClick={() => handleRemove(track.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400/70 transition-colors rounded-lg hover:bg-white/[0.05] opacity-0 group-hover:opacity-100"
                    aria-label="Retirer de la playlist"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Supprimer la playlist */}
        {!loading && !error && (
          <div className="mt-10 pt-6 border-t border-white/[0.05]">
            <button
              onClick={async () => {
                await deletePlaylist(id);
                router.push('/library');
              }}
              className="flex items-center gap-2 text-white/20 hover:text-red-400/60 text-xs transition-colors"
            >
              <Trash2 size={13} />
              Supprimer la playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
