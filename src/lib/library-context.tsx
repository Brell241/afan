'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useSession } from '@/lib/auth-client';
import type { Playlist } from '@/db/schema';

interface LibraryContextValue {
  likedTrackIds: Set<string>;
  likedAlbumIds: Set<string>;
  likedArtistIds: Set<string>;
  playlists: (Playlist & { trackCount: number })[];
  isLoaded: boolean;
  isLiked: (type: 'track' | 'album' | 'artist', id: string) => boolean;
  toggleLike: (type: 'track' | 'album' | 'artist', id: string) => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist & { trackCount: number }>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  showAuthModal: () => void;
  authModalOpen: boolean;
  closeAuthModal: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const [likedAlbumIds, setLikedAlbumIds] = useState<Set<string>>(new Set());
  const [likedArtistIds, setLikedArtistIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<(Playlist & { trackCount: number })[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id ?? null;
    if (userId === loadedFor.current) return;
    loadedFor.current = userId;

    if (!userId) {
      Promise.resolve().then(() => {
        setLikedTrackIds(new Set());
        setLikedAlbumIds(new Set());
        setLikedArtistIds(new Set());
        setPlaylists([]);
        setIsLoaded(true);
      });
      return;
    }

    Promise.resolve().then(() => setIsLoaded(false));
    Promise.all([
      fetch('/api/likes').then((r) => r.json()),
      fetch('/api/playlists').then((r) => r.json()),
    ]).then(([likesData, playlistsData]) => {
      setLikedTrackIds(new Set(likesData.trackIds ?? []));
      setLikedAlbumIds(new Set(likesData.albumIds ?? []));
      setLikedArtistIds(new Set(likesData.artistIds ?? []));
      setPlaylists(playlistsData ?? []);
      setIsLoaded(true);
    });
  }, [session?.user?.id]);

  const isLiked = useCallback(
    (type: 'track' | 'album' | 'artist', id: string) => {
      if (type === 'track') return likedTrackIds.has(id);
      if (type === 'album') return likedAlbumIds.has(id);
      return likedArtistIds.has(id);
    },
    [likedTrackIds, likedAlbumIds, likedArtistIds]
  );

  const toggleLike = useCallback(
    async (type: 'track' | 'album' | 'artist', id: string) => {
      if (!session?.user) { setAuthModalOpen(true); return; }

      const wasLiked = isLiked(type, id);
      const setter = type === 'track' ? setLikedTrackIds : type === 'album' ? setLikedAlbumIds : setLikedArtistIds;

      // Optimistic update
      setter((prev) => {
        const next = new Set(prev);
        if (wasLiked) { next.delete(id); } else { next.add(id); }
        return next;
      });

      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      if (!res.ok) {
        // Rollback
        setter((prev) => {
          const next = new Set(prev);
          if (wasLiked) { next.add(id); } else { next.delete(id); }
          return next;
        });
      }
    },
    [session?.user, isLiked]
  );

  const createPlaylist = useCallback(async (name: string) => {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const playlist = await res.json();
    const withCount = { ...playlist, trackCount: 0 };
    setPlaylists((prev) => [...prev, withCount]);
    return withCount;
  }, []);

  const addToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId }),
    });
    setPlaylists((prev) =>
      prev.map((p) => p.id === playlistId ? { ...p, trackCount: p.trackCount + 1 } : p)
    );
  }, []);

  const removeFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId }),
    });
    setPlaylists((prev) =>
      prev.map((p) => p.id === playlistId ? { ...p, trackCount: Math.max(0, p.trackCount - 1) } : p)
    );
  }, []);

  const deletePlaylist = useCallback(async (id: string) => {
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <LibraryContext.Provider value={{
      likedTrackIds,
      likedAlbumIds,
      likedArtistIds,
      playlists,
      isLoaded,
      isLiked,
      toggleLike,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      showAuthModal: () => setAuthModalOpen(true),
      authModalOpen,
      closeAuthModal: () => setAuthModalOpen(false),
    }}>
      {children}
    </LibraryContext.Provider>
  );
}
