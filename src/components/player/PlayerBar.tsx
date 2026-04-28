'use client';

import Image from 'next/image';
import {
  Play, Pause, X, Loader2, Music2, AlertCircle,
  SkipBack, SkipForward, Volume2, VolumeX, Volume1,
} from 'lucide-react';
import { usePlayer } from '@/lib/player-context';

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

export function PlayerBar() {
  const {
    track, album, artist,
    status, isPlaying, currentTime, duration,
    canPlayPrev, canPlayNext,
    volume, muted,
    togglePlay, playPrev, playNext, seek, setVolume, toggleMute, close,
  } = usePlayer();

  if (!track) return null;

  const imageUrl = track.image_url ?? album?.image_url ?? null;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 bg-[#0c0c0c]/97 backdrop-blur-2xl border-t border-white/[0.06]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Barre de progression — fine, toute la largeur, en haut */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] bg-white/[0.06] cursor-pointer group/prog"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-white/50 group-hover/prog:bg-white transition-colors duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── MOBILE (< lg) ── */}
      <div className="flex lg:hidden items-center h-16 px-4 gap-3">
        {/* Vignette + titre — flex-1 */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-white/5">
            {imageUrl ? (
              <Image src={imageUrl} alt={track.title} fill sizes="40px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={14} className="text-white/15" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-medium truncate leading-tight">{track.title}</p>
            <p className="text-white/40 text-[11px] truncate mt-0.5">{artist?.name}</p>
          </div>
        </div>

        {/* Contrôles centrés */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={playPrev}
            disabled={!canPlayPrev}
            aria-label="Précédent"
            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 transition-all"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            disabled={status === 'loading' || status === 'error'}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-black active:scale-90 transition-transform disabled:opacity-35"
          >
            {status === 'loading' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            disabled={!canPlayNext}
            aria-label="Suivant"
            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 transition-all"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Fermer */}
        <button
          onClick={close}
          aria-label="Fermer"
          className="w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/60 active:scale-90 transition-all shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center h-[72px] px-4 gap-6">

        {/* Gauche — vignette + titre */}
        <div className="flex items-center gap-3 w-[260px] shrink-0 min-w-0">
          <div className="relative w-11 h-11 rounded overflow-hidden shrink-0 bg-white/5">
            {imageUrl ? (
              <Image src={imageUrl} alt={track.title} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={16} className="text-white/15" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-medium truncate leading-tight">{track.title}</p>
            <p className="text-white/35 text-[11px] truncate mt-0.5">{artist?.name}</p>
          </div>
        </div>

        {/* Centre — contrôles + barre */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 min-w-0">
          <div className="flex items-center gap-3">
            <button onClick={playPrev} disabled={!canPlayPrev} aria-label="Précédent"
              className="text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1">
              <SkipBack size={16} fill="currentColor" />
            </button>
            <button onClick={togglePlay} disabled={status === 'loading' || status === 'error'}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-35 disabled:hover:scale-100 disabled:cursor-not-allowed">
              {status === 'loading' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" className="ml-px" />
              )}
            </button>
            <button onClick={playNext} disabled={!canPlayNext} aria-label="Suivant"
              className="text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1">
              <SkipForward size={16} fill="currentColor" />
            </button>
          </div>

          {/* Barre de progression avec timecodes */}
          <div className="w-full max-w-[520px] flex items-center gap-2">
            <span className="text-white/25 text-[10px] font-mono tabular-nums w-7 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-[3px] bg-white/10 rounded-full cursor-pointer group/slider relative"
              onClick={handleProgressClick}>
              <div className="h-full bg-white rounded-full relative transition-none" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover/slider:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-white/25 text-[10px] font-mono tabular-nums w-7 shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Droite — volume + actions */}
        <div className="w-[260px] shrink-0 flex items-center justify-end gap-2">
          {status === 'error' && (
            <div className="flex items-center gap-1.5 text-orange-400/60 text-xs">
              <AlertCircle size={12} />
              <span className="hidden xl:inline">Lecteur indisponible</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} aria-label={muted ? 'Activer le son' : 'Couper le son'}
              className="text-white/30 hover:text-white/70 transition-colors shrink-0">
              {muted || volume === 0 ? <VolumeX size={15} /> : volume < 50 ? <Volume1 size={15} /> : <Volume2 size={15} />}
            </button>
            <div className="relative w-20 h-[3px] bg-white/10 rounded-full cursor-pointer group/vol"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
              }}>
              <div className="h-full bg-white/60 group-hover/vol:bg-white rounded-full relative transition-colors"
                style={{ width: `${muted ? 0 : volume}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover/vol:opacity-100 transition-opacity shadow" />
              </div>
            </div>
          </div>

          {track.youtube_url && (
            <a href={track.youtube_url} target="_blank" rel="noopener noreferrer"
              className="opacity-30 hover:opacity-100 transition-opacity p-1" aria-label="Ouvrir sur YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000" />
                <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fff" />
              </svg>
            </a>
          )}

          <button onClick={close} aria-label="Fermer le lecteur"
            className="text-white/20 hover:text-white/60 transition-colors p-1">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
