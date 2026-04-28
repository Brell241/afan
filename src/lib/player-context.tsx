'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Track, Album } from '@/db/schema';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error';

type ArtistRef = { name: string; slug: string };

interface PlayerContextValue {
  track: Track | null;
  album: Album | null;
  artist: ArtistRef | null;
  status: PlayerStatus;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canPlayPrev: boolean;
  canPlayNext: boolean;
  volume: number;
  muted: boolean;
  play: (track: Track, album: Album, artist: ArtistRef, queue?: Track[]) => void;
  playPrev: () => void;
  playNext: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

function extractVideoId(url: string): string | null {
  const m = url.match(/[?&]v=([^&]+)/);
  return m ? m[1] : null;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<{ track: Track; album: Album; artist: ArtistRef } | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);
  const prevVolumeRef = useRef(80);
  const volumeRef = useRef(80);
  const mutedRef = useRef(false);

  const playerRef = useRef<any>(null);
  const playerElRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /* Refs pour éviter les closures stales dans onStateChange */
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(-1);
  const entryRef = useRef<typeof entry>(null);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { entryRef.current = entry; }, [entry]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  /* Titre de l'onglet */
  useEffect(() => {
    document.title = entry
      ? `${entry.track.title} · ${entry.artist.name} — Afan`
      : 'Afan — La Forêt | Patrimoine Musical Gabonais';
  }, [entry]);

  /* Div hors-écran requis par l'API YouTube IFrame */
  useEffect(() => {
    const div = document.createElement('div');
    div.id = 'yt-global-player';
    div.style.cssText =
      'position:fixed;width:320px;height:180px;top:-400px;left:-400px;pointer-events:none;z-index:-1;';
    document.body.appendChild(div);
    playerElRef.current = div;
    return () => { if (document.body.contains(div)) document.body.removeChild(div); };
  }, []);

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const destroyPlayer = useCallback(() => {
    clearTick();
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setStatus('idle');
  }, []);

  /* Jouer un track par index dans la queue courante — sans modifier album/artist */
  const playAtIndex = useCallback((idx: number) => {
    const q = queueRef.current;
    const e = entryRef.current;
    if (!e || idx < 0 || idx >= q.length) return;
    const nextTrack = q[idx];
    setQueueIndex(idx);
    setEntry({ ...e, track: nextTrack });
    destroyPlayer();
    const videoId = nextTrack.youtube_url ? extractVideoId(nextTrack.youtube_url) : null;
    if (videoId) initPlayer(videoId); // initPlayer défini ci-dessous via ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destroyPlayer]);

  const playAtIndexRef = useRef(playAtIndex);
  useEffect(() => { playAtIndexRef.current = playAtIndex; }, [playAtIndex]);

  const initPlayer = useCallback((videoId: string) => {
    if (!playerElRef.current) return;
    setStatus('loading');

    const create = () => {
      playerRef.current = new window.YT.Player(playerElRef.current!, {
        videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, iv_load_policy: 3, modestbranding: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(mutedRef.current ? 0 : volumeRef.current);
            setDuration(e.target.getDuration() || 0);
            setStatus('ready');
            e.target.playVideo();
          },
          onError: () => setStatus('error'),
          onStateChange: (e: any) => {
            if (e.data === 0) {
              /* Fin du morceau → suivant automatique */
              const nextIdx = queueIndexRef.current + 1;
              if (nextIdx < queueRef.current.length) {
                playAtIndexRef.current(nextIdx);
              }
              return;
            }
            const playing = e.data === 1;
            setIsPlaying(playing);
            if (playing) {
              intervalRef.current = setInterval(() => {
                if (playerRef.current?.getCurrentTime) setCurrentTime(playerRef.current.getCurrentTime());
              }, 500);
            } else {
              clearTick();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      create();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); create(); };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.onerror = () => setStatus('error');
        document.head.appendChild(s);
      }
    }
  }, []);

  const play = useCallback(
    (track: Track, album: Album, artist: ArtistRef, newQueue?: Track[]) => {
      const q = newQueue ?? [track];
      const idx = q.findIndex((t) => t.id === track.id);
      setQueue(q);
      setQueueIndex(idx);
      queueRef.current = q;
      queueIndexRef.current = idx;
      setEntry({ track, album, artist });
      destroyPlayer();
      const videoId = track.youtube_url ? extractVideoId(track.youtube_url) : null;
      if (videoId) initPlayer(videoId);
    },
    [destroyPlayer, initPlayer]
  );

  const playPrev = useCallback(() => {
    playAtIndexRef.current(queueIndexRef.current - 1);
  }, []);

  const playNext = useCallback(() => {
    playAtIndexRef.current(queueIndexRef.current + 1);
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current || status !== 'ready') return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isPlaying, status]);

  const seek = useCallback((time: number) => {
    if (!playerRef.current || status !== 'ready') return;
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  }, [status]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v));
    setVolumeState(clamped);
    setMuted(clamped === 0);
    if (clamped > 0) prevVolumeRef.current = clamped;
    if (playerRef.current?.setVolume) playerRef.current.setVolume(clamped);
  }, []);

  const toggleMute = useCallback(() => {
    if (muted) {
      const v = prevVolumeRef.current || 80;
      setVolumeState(v);
      setMuted(false);
      if (playerRef.current?.setVolume) playerRef.current.setVolume(v);
    } else {
      prevVolumeRef.current = volume;
      setVolumeState(0);
      setMuted(true);
      if (playerRef.current?.setVolume) playerRef.current.setVolume(0);
    }
  }, [muted, volume]);

  const close = useCallback(() => {
    destroyPlayer();
    setEntry(null);
    setQueue([]);
    setQueueIndex(-1);
  }, [destroyPlayer]);

  return (
    <PlayerContext.Provider
      value={{
        track: entry?.track ?? null,
        album: entry?.album ?? null,
        artist: entry?.artist ?? null,
        status,
        isPlaying,
        currentTime,
        duration,
        canPlayPrev: queueIndex > 0,
        canPlayNext: queueIndex < queue.length - 1,
        volume,
        muted,
        play,
        playPrev,
        playNext,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        close,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
