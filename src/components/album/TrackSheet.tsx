'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, Play, Pause, ExternalLink, Music2, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Track, Album } from '@/db/schema';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface TrackSheetProps {
  track: Track | null;
  album: Album;
  artist: { name: string; slug: string };
  onClose: () => void;
}

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error';

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function extractVideoId(url: string): string | null {
  const m = url.match(/[?&]v=([^&]+)/);
  return m ? m[1] : null;
}

export function TrackSheet({ track, album, artist, onClose }: TrackSheetProps) {
  const playerRef = useRef<any>(null);
  /* Le div du player doit avoir une taille réelle pour que l'API YouTube s'initialise */
  const playerElRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoId = track?.youtube_url ? extractVideoId(track.youtube_url) : null;

  /* ── Div caché dans le body — 320×180 hors écran (dimensions réelles requises par l'API) ── */
  useEffect(() => {
    const div = document.createElement('div');
    div.id = 'yt-audio-player';
    div.style.cssText =
      'position:fixed;width:320px;height:180px;top:-400px;left:-400px;pointer-events:none;';
    document.body.appendChild(div);
    playerElRef.current = div;
    return () => {
      if (document.body.contains(div)) document.body.removeChild(div);
    };
  }, []);

  /* ── Escape ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* ── Nettoyer ── */
  const destroyPlayer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { /* ignoré */ }
      playerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setStatus('idle');
  }, []);

  /* ── Créer le player YouTube ── */
  const initPlayer = useCallback((vid: string) => {
    if (!playerElRef.current || !window.YT?.Player) return;

    setStatus('loading');

    /* Timeout : si le player ne répond pas en 12 s, on bascule en erreur */
    timeoutRef.current = setTimeout(() => {
      if (status !== 'ready') setStatus('error');
    }, 12_000);

    playerRef.current = new window.YT.Player(playerElRef.current, {
      videoId: vid,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: any) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setDuration(e.target.getDuration() || 0);
          setStatus('ready');
        },
        onError: () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus('error');
        },
        onStateChange: (e: any) => {
          const playing = e.data === 1; /* YT.PlayerState.PLAYING */
          setIsPlaying(playing);
          if (playing) {
            intervalRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
              }
            }, 500);
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        },
      },
    });
  }, [status]);

  /* ── Charger l'API et lancer le player au changement de videoId ── */
  useEffect(() => {
    destroyPlayer();
    if (!videoId) return;

    const setup = () => initPlayer(videoId);

    if (window.YT?.Player) {
      setup();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        setup();
      };
      /* Injecter le script une seule fois */
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.onerror = () => setStatus('error');
        document.head.appendChild(s);
      }
    }

    return destroyPlayer;
    // initPlayer volontairement exclu des deps (stable par construction)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, destroyPlayer]);

  const togglePlay = () => {
    if (!playerRef.current || status !== 'ready') return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || status !== 'ready' || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const open = !!track;
  const hasLyrics = track?.lyrics_fr || track?.lyrics_original;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[440px] bg-[#0f0f0f] border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* En-tête */}
        <div className="flex items-start gap-4 p-5 border-b border-white/10 shrink-0">
          <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0 bg-white/5">
            {(track?.image_url ?? album.image_url) ? (
              <Image
                src={(track?.image_url ?? album.image_url)!}
                alt={track?.title ?? album.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={28} className="text-white/20" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white/40 text-xs mb-1 truncate">{album.title} · {album.year}</p>
            <h2 className="text-white font-bold text-lg leading-tight truncate">{track?.title}</h2>
            <p className="text-white/50 text-sm mt-0.5">{artist.name}</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="text-white/40 hover:text-white transition-colors p-1 mt-0.5 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* Lecteur */}
          <div className="p-5 border-b border-white/10">
            {videoId ? (
              <div className="space-y-3">

                {/* Erreur de chargement */}
                {status === 'error' && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 text-white/50 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-orange-400/70" />
                    <span>Impossible de charger le lecteur — YouTube est peut-être inaccessible sur ce réseau.</span>
                  </div>
                )}

                {/* Contrôles */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    disabled={status !== 'ready'}
                    aria-label={isPlaying ? 'Pause' : 'Lecture'}
                    className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div
                      role="slider"
                      aria-valuenow={currentTime}
                      aria-valuemin={0}
                      aria-valuemax={duration}
                      className={`h-1.5 bg-white/10 rounded-full relative group ${status === 'ready' ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={seek}
                    >
                      <div
                        className="h-full bg-[#1DB954] rounded-full relative"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                      >
                        {status === 'ready' && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-white/30 text-xs font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={track?.youtube_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/25 text-xs hover:text-white/50 transition-colors w-fit"
                >
                  <ExternalLink size={11} />
                  Ouvrir sur YouTube
                </a>
              </div>
            ) : (
              <div className="py-4 text-center text-white/20 text-sm italic">
                Aucun lien audio disponible pour ce titre.
              </div>
            )}
          </div>

          {/* Contexte */}
          {track?.context && (
            <div className="p-5 border-b border-white/10">
              <h3 className="text-[#1DB954] text-xs font-bold uppercase tracking-widest mb-3">À propos</h3>
              <p className="text-[#B3B3B3] text-sm leading-relaxed">{track.context}</p>
            </div>
          )}

          {/* Paroles */}
          {hasLyrics && (
            <div className="p-5">
              <h3 className="text-[#1DB954] text-xs font-bold uppercase tracking-widest mb-4">Paroles</h3>
              {track?.lyrics_fr && track?.lyrics_original ? (
                <Tabs defaultValue="original">
                  <TabsList className="mb-4">
                    <TabsTrigger value="original">Fang</TabsTrigger>
                    <TabsTrigger value="fr">Français</TabsTrigger>
                  </TabsList>
                  <TabsContent value="original">
                    <pre className="text-[#B3B3B3] text-sm leading-8 whitespace-pre-wrap font-sans">{track.lyrics_original}</pre>
                  </TabsContent>
                  <TabsContent value="fr">
                    <pre className="text-[#B3B3B3] text-sm leading-8 whitespace-pre-wrap font-sans">{track.lyrics_fr}</pre>
                  </TabsContent>
                </Tabs>
              ) : track?.lyrics_original ? (
                <>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Fang</p>
                  <pre className="text-[#B3B3B3] text-sm leading-8 whitespace-pre-wrap font-sans">{track.lyrics_original}</pre>
                </>
              ) : (
                <>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Français</p>
                  <pre className="text-[#B3B3B3] text-sm leading-8 whitespace-pre-wrap font-sans">{track.lyrics_fr}</pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
