'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ListMusic, Play, Trash2, Music2, LogIn, ChevronRight } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useLibrary } from '@/lib/library-context';
import { usePlayer } from '@/lib/player-context';
import type { QueueEntry } from '@/lib/player-context';

function EmptyState({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center px-4">
      <Heart size={40} className="text-white/10" />
      <div>
        <p className="text-white/50 font-medium">Ta bibliothèque est vide</p>
        <p className="text-white/25 text-sm mt-1">Connecte-toi pour sauvegarder tes titres favoris.</p>
      </div>
      <button
        onClick={onLogin}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform"
      >
        <LogIn size={14} />
        Se connecter
      </button>
    </div>
  );
}

interface LikedTrack {
  track: { id: string; title: string; youtube_url: string | null; image_url: string | null; duration: string | null };
  album: { id: string; title: string; slug: string; image_url: string | null; artist_id: string | null };
  artist: { name: string; slug: string };
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const { playlists, likedTrackIds, toggleLike, deletePlaylist, showAuthModal } = useLibrary();
  const { playAll } = usePlayer();
  const [tab, setTab] = useState<'liked' | 'playlists'>('liked');
  const [likedTracks, setLikedTracks] = useState<LikedTrack[] | null>(null);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState<Record<string, { entries: QueueEntry[]; loading: boolean }>>({});

  async function loadLikedTracks() {
    if (likedTracks !== null || loadingLiked) return;
    setLoadingLiked(true);
    try {
      const res = await fetch('/api/likes/tracks');
      const data = await res.json();
      setLikedTracks(data.tracks ?? []);
    } finally {
      setLoadingLiked(false);
    }
  }

  async function loadPlaylistTracks(id: string) {
    if (playlistTracks[id]) return;
    setPlaylistTracks((prev) => ({ ...prev, [id]: { entries: [], loading: true } }));
    const res = await fetch(`/api/playlists/${id}`);
    const data = await res.json();
    setPlaylistTracks((prev) => ({
      ...prev,
      [id]: { entries: data.entries ?? [], loading: false },
    }));
  }

  function handleTabLiked() {
    setTab('liked');
    loadLikedTracks();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-20 pb-24">

        <div className="mb-8">
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-1">Bibliothèque</p>
          <h1 className="text-white font-black text-4xl tracking-tight">Ma musique</h1>
        </div>

        {!session?.user ? (
          <EmptyState onLogin={showAuthModal} />
        ) : (
          <>
            {/* Onglets */}
            <div className="flex gap-1 mb-8 border-b border-white/[0.06]">
              {([['liked', 'Titres aimés', Heart], ['playlists', 'Playlists', ListMusic]] as const).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => key === 'liked' ? handleTabLiked() : setTab('playlists')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    tab === key
                      ? 'border-white text-white'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {key === 'liked' && likedTrackIds.size > 0 && (
                    <span className="text-[10px] text-white/30 font-mono">{likedTrackIds.size}</span>
                  )}
                  {key === 'playlists' && playlists.length > 0 && (
                    <span className="text-[10px] text-white/30 font-mono">{playlists.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Titres aimés */}
            {tab === 'liked' && (
              <div>
                {likedTrackIds.size === 0 ? (
                  <p className="text-white/25 text-sm py-12 text-center">
                    Tu n&apos;as pas encore aimé de titre.<br />
                    Clique sur le cœur dans la tracklist ou le lecteur.
                  </p>
                ) : loadingLiked ? (
                  <div className="flex justify-center py-16">
                    <span className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
                  </div>
                ) : likedTracks === null ? null : likedTracks.length === 0 ? (
                  <p className="text-white/25 text-sm py-12 text-center">Chargement en cours…</p>
                ) : (
                  <div className="divide-y divide-white/[0.05]">
                    {likedTracks.map(({ track, album, artist }) => (
                      <div key={track.id} className="flex items-center gap-4 py-2.5 px-3 group rounded-lg hover:bg-white/[0.04] transition-colors">
                        <div className="relative w-10 h-10 rounded shrink-0 bg-white/5 overflow-hidden">
                          {(track.image_url ?? album.image_url) ? (
                            <Image src={(track.image_url ?? album.image_url)!} alt={track.title} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music2 size={14} className="text-white/15" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm font-medium truncate">{track.title}</p>
                          <p className="text-white/35 text-xs truncate">
                            <Link href={`/artist/${artist.slug}`} className="hover:underline">{artist.name}</Link>
                            {' · '}
                            <Link href={`/artist/${artist.slug}/album/${album.slug}`} className="hover:underline">{album.title}</Link>
                          </p>
                        </div>
                        {track.duration && <span className="text-white/25 text-xs font-mono shrink-0">{track.duration}</span>}
                        <button
                          onClick={() => toggleLike('track', track.id)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center text-[#e85d7e] hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Retirer des favoris"
                        >
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playlists */}
            {tab === 'playlists' && (
              <div className="flex flex-col gap-3">
                {playlists.length === 0 ? (
                  <p className="text-white/25 text-sm py-12 text-center">
                    Aucune playlist.<br />
                    Crée-en une depuis le bouton <span className="text-white/40">+</span> dans la tracklist.
                  </p>
                ) : (
                  playlists.map((playlist) => {
                    return (
                      <div key={playlist.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <Link href={`/library/playlist/${playlist.short_id ?? playlist.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                              <ListMusic size={16} className="text-white/30" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm truncate">{playlist.name}</p>
                              <p className="text-white/30 text-xs">{playlist.trackCount} titre{playlist.trackCount !== 1 ? 's' : ''}</p>
                            </div>
                            <ChevronRight size={14} className="text-white/20 shrink-0 mr-1" />
                          </Link>
                          <div className="flex items-center gap-2">
                            {playlist.trackCount > 0 && (
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  await loadPlaylistTracks(playlist.id);
                                  const entries = playlistTracks[playlist.id]?.entries ?? [];
                                  if (entries.length === 0) return;
                                  const firstArtist = entries[0].artist ?? { name: '', slug: '' };
                                  playAll(entries, firstArtist);
                                }}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                              >
                                <Play size={13} fill="currentColor" className="ml-0.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.preventDefault(); deletePlaylist(playlist.id); }}
                              className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400/70 transition-colors rounded-lg hover:bg-white/[0.05]"
                              aria-label="Supprimer la playlist"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
