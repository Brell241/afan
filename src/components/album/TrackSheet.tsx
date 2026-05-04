'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X, Play, Pause, ExternalLink, Music2, Loader2, AlertCircle,
  PencilLine, WandSparkles, BookOpen,
} from 'lucide-react';
import { ShareButton } from '@/components/ui/ShareButton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { usePlayer } from '@/lib/player-context';
import type { Track, Album } from '@/db/schema';

interface TrackSheetProps {
  track: Track | null;
  tracks: Track[];
  album: Album;
  artist: { name: string; slug: string };
  onClose: () => void;
  onSaved?: () => void;
}

type ActiveTab = 'paroles' | 'contexte';
type PolishField = 'context' | 'lyrics_fr' | 'lyrics_original';

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

async function callPolish(text: string, type: PolishField): Promise<string> {
  const res = await fetch('/api/polish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type }),
  });
  if (!res.ok) throw new Error();
  const { result } = await res.json();
  return result;
}

/* ─────────── Bouton Embellir ─────────── */
function PolishBtn({ onClick, loading, label = 'Embellir' }: {
  onClick: () => void; loading: boolean; label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={10} className="animate-spin" /> : <WandSparkles size={10} />}
      {label}
    </button>
  );
}

/* ─────────── Barre d'onglets ─────────── */
function TabBar({ active, onChange, hasParoles, hasContexte }: {
  active: ActiveTab;
  onChange: (t: ActiveTab) => void;
  hasParoles: boolean;
  hasContexte: boolean;
}) {
  const hasContent = { paroles: hasParoles, contexte: hasContexte };
  return (
    <div className="flex shrink-0 border-b border-white/[0.07]">
      {(['paroles', 'contexte'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative flex items-center gap-1.5 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
            active === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
          }`}
        >
          {tab === 'paroles' ? 'Paroles' : 'Contexte'}
          {hasContent[tab] && (
            <span className={`w-1 h-1 rounded-full ${active === tab ? 'bg-[#1DB954]' : 'bg-white/25'}`} />
          )}
          {active === tab && (
            <span className="absolute bottom-0 left-5 right-5 h-px bg-[#1DB954]" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─────────── État vide ─────────── */
function EmptyState({ icon, line1, line2, cta, onClick }: {
  icon: React.ReactNode; line1: string; line2: string; cta: string; onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-14 px-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-white/45 text-sm">{line1}</p>
        <p className="text-white/20 text-xs">{line2}</p>
      </div>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 text-xs font-medium transition-all"
      >
        + {cta}
      </button>
    </div>
  );
}

/* ─────────── Sous-onglets Fang / Français ─────────── */
function LyricsSubTabs({ fr, original }: { fr: string; original: string }) {
  const [lang, setLang] = useState<'fr' | 'original'>('fr');
  return (
    <>
      <div className="flex gap-1 mb-5">
        {(['fr', 'original'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
              lang === l ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/55'
            }`}
          >
            {l === 'fr' ? 'Français' : 'Fang'}
          </button>
        ))}
      </div>
      <pre className="text-white/65 text-sm leading-8 whitespace-pre-wrap font-sans">
        {lang === 'fr' ? fr : original}
      </pre>
    </>
  );
}

/* ─────────── Formulaire paroles ─────────── */
function LyricsForm({ initialOriginal, initialFr, onSave, onCancel }: {
  initialOriginal: string; initialFr: string;
  onSave: (o: string, fr: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [original, setOriginal] = useState(initialOriginal);
  const [fr, setFr] = useState(initialFr);
  const [polishing, setPolishing] = useState<PolishField | null>(null);
  const [saving, setSaving] = useState(false);

  async function polish(field: PolishField) {
    const text = field === 'lyrics_original' ? original : fr;
    if (!text.trim()) return;
    setPolishing(field);
    try {
      const result = await callPolish(text, field);
      field === 'lyrics_original' ? setOriginal(result) : setFr(result);
    } catch { toast.error('Erreur DeepSeek.'); }
    finally { setPolishing(null); }
  }

  async function handleSave() {
    setSaving(true);
    try { await onSave(original, fr); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="space-y-2">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Fang (original)</p>
        <Textarea value={original} onChange={(e) => setOriginal(e.target.value)}
          placeholder="Paroles en fang…" rows={6}
          className="bg-[#1a1a1a] border-white/[0.08] text-white/80 text-sm leading-relaxed resize-none focus:border-violet-500/30 focus:ring-0 placeholder:text-white/20 font-mono" />
        <PolishBtn onClick={() => polish('lyrics_original')} loading={polishing === 'lyrics_original'} label="Mettre en forme" />
      </div>
      <div className="space-y-2">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Traduction française</p>
        <Textarea value={fr} onChange={(e) => setFr(e.target.value)}
          placeholder="Traduction en français…" rows={6}
          className="bg-[#1a1a1a] border-white/[0.08] text-white/80 text-sm leading-relaxed resize-none focus:border-violet-500/30 focus:ring-0 placeholder:text-white/20" />
        <PolishBtn onClick={() => polish('lyrics_fr')} loading={polishing === 'lyrics_fr'} label="Embellir la traduction" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <button onClick={onCancel} className="text-white/30 hover:text-white/60 text-xs transition-colors">Annuler</button>
        <button onClick={handleSave} disabled={saving || (!original.trim() && !fr.trim())}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/20 text-[#1DB954] text-xs font-semibold transition-all disabled:opacity-40">
          {saving && <Loader2 size={10} className="animate-spin" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

/* ─────────── Formulaire contexte ─────────── */
function ContextForm({ initial, onSave, onCancel }: {
  initial: string;
  onSave: (text: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [polishing, setPolishing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function polish() {
    if (!draft.trim()) return;
    setPolishing(true);
    try { setDraft(await callPolish(draft, 'context')); }
    catch { toast.error('Erreur DeepSeek.'); }
    finally { setPolishing(false); }
  }

  async function handleSave() {
    setSaving(true);
    try { await onSave(draft); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      <Textarea value={draft} onChange={(e) => setDraft(e.target.value)}
        placeholder="L'histoire, l'anecdote ou le contexte de ce titre…" rows={8}
        className="bg-[#1a1a1a] border-white/[0.08] text-white/80 text-sm leading-relaxed resize-none focus:border-violet-500/30 focus:ring-0 placeholder:text-white/20" />
      <div className="flex items-center justify-between">
        <PolishBtn onClick={polish} loading={polishing} label="Embellir avec DeepSeek" />
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="text-white/30 hover:text-white/60 text-xs transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving || !draft.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/20 text-[#1DB954] text-xs font-semibold transition-all disabled:opacity-40">
            {saving && <Loader2 size={10} className="animate-spin" />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Composant principal ─────────── */
export function TrackSheet({ track, tracks, album, artist, onClose, onSaved }: TrackSheetProps) {
  /* ── Lecteur global (PlayerProvider) ── */
  const {
    play, togglePlay, seek,
    track: activeTrack, status, isPlaying, currentTime, duration,
  } = usePlayer();

  const isThisTrack = !!track && activeTrack?.id === track.id;
  const playerStatus  = isThisTrack ? status : 'idle';
  const playerPlaying = isThisTrack && isPlaying;
  const playerTime    = isThisTrack ? currentTime : 0;
  const playerDur     = isThisTrack ? duration : 0;
  const progress      = playerDur ? (playerTime / playerDur) * 100 : 0;

  function handleToggle() {
    if (!track?.youtube_url) return;
    if (isThisTrack) togglePlay();
    else play(track, album, artist, tracks.map((t) => ({ track: t, album })));
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!isThisTrack || !playerDur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * playerDur);
  }

  /* ── UI state ── */
  const [activeTab, setActiveTab] = useState<ActiveTab>('paroles');
  const [editingContext, setEditingContext] = useState(false);
  const [editingLyrics, setEditingLyrics] = useState(false);

  const [localContext, setLocalContext] = useState<string | null | undefined>(undefined);
  const [localLyricsOriginal, setLocalLyricsOriginal] = useState<string | null | undefined>(undefined);
  const [localLyricsFr, setLocalLyricsFr] = useState<string | null | undefined>(undefined);

  const displayContext         = localContext !== undefined ? localContext : track?.context;
  const displayLyricsOriginal  = localLyricsOriginal !== undefined ? localLyricsOriginal : track?.lyrics_original;
  const displayLyricsFr        = localLyricsFr !== undefined ? localLyricsFr : track?.lyrics_fr;
  const hasLyrics = !!displayLyricsOriginal || !!displayLyricsFr;

  useEffect(() => {
    setLocalContext(undefined);
    setLocalLyricsOriginal(undefined);
    setLocalLyricsFr(undefined);
    setEditingContext(false);
    setEditingLyrics(false);
    /* Par défaut : paroles si dispo, sinon contexte si dispo, sinon paroles */
    const hasL = !!(track?.lyrics_fr || track?.lyrics_original);
    const hasC = !!track?.context;
    setActiveTab(!hasL && hasC ? 'contexte' : 'paroles');
  }, [track?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* ── Sauvegarde ── */
  async function saveContext(text: string) {
    if (!track) return;
    const res = await fetch(`/api/tracks/${track.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: text }),
    });
    if (!res.ok) { toast.error('Erreur de sauvegarde.'); return; }
    setLocalContext(text);
    setEditingContext(false);
    toast.success('Contexte sauvegardé.');
    onSaved?.();
  }

  async function saveLyrics(original: string, fr: string) {
    if (!track) return;
    const res = await fetch(`/api/tracks/${track.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lyrics_original: original, lyrics_fr: fr }),
    });
    if (!res.ok) { toast.error('Erreur de sauvegarde.'); return; }
    setLocalLyricsOriginal(original || null);
    setLocalLyricsFr(fr || null);
    setEditingLyrics(false);
    toast.success('Paroles sauvegardées.');
    onSaved?.();
  }

  const open = !!track;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/65 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:max-w-[460px] bg-[#0f0f0f] border-l border-white/[0.07] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ─── En-tête ─── */}
        <div className="flex items-start gap-4 px-5 py-4 border-b border-white/[0.07] shrink-0">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/[0.05]">
            {(track?.image_url ?? album.image_url) ? (
              <Image src={(track?.image_url ?? album.image_url)!} alt={track?.title ?? album.title}
                fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={22} className="text-white/20" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-white/30 text-[11px] truncate">{album.title} · {album.year}</p>
            <h2 className="text-white font-bold text-[17px] leading-snug truncate mt-0.5">{track?.title}</h2>
            <p className="text-white/40 text-sm mt-0.5">{artist.name}</p>
          </div>
          {track && (
            <ShareButton
              url={`/artist/${artist.slug}/album/${album.slug}`}
              title={`"${track.title}" par ${artist.name} — Afan`}
              text={track.context ? track.context.slice(0, 200) : `Album : ${album.title}${album.year ? ` (${album.year})` : ''}`}
              iconOnly
              className="text-white/30 hover:text-white/70 transition-colors p-1 mt-0.5 shrink-0"
            />
          )}
          <button onClick={onClose} aria-label="Fermer" className="text-white/30 hover:text-white/70 transition-colors p-1 mt-0.5 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* ─── Lecteur (piloté par PlayerProvider) ─── */}
        <div className="px-5 py-4 border-b border-white/[0.07] shrink-0">
          {track?.youtube_url ? (
            <div className="space-y-3">
              {playerStatus === 'error' && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] text-white/40 text-xs">
                  <AlertCircle size={12} className="shrink-0 text-orange-400/60" />
                  Lecteur indisponible sur ce réseau.
                </div>
              )}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggle}
                  disabled={playerStatus === 'error'}
                  aria-label={playerPlaying ? 'Pause' : 'Lecture'}
                  className="w-11 h-11 rounded-full bg-[#1DB954] flex items-center justify-center text-black shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {playerStatus === 'loading' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : playerPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <div className="flex-1 space-y-2">
                  <div
                    role="slider" aria-valuenow={playerTime} aria-valuemin={0} aria-valuemax={playerDur}
                    className={`h-1 bg-white/[0.08] rounded-full relative group ${isThisTrack && playerDur ? 'cursor-pointer' : ''}`}
                    onClick={handleSeek}
                  >
                    <div className="h-full bg-[#1DB954] rounded-full relative" style={{ width: `${progress}%` }}>
                      {isThisTrack && playerDur > 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-white/25 text-[10px] font-mono">
                    <span>{formatTime(playerTime)}</span>
                    <span>{formatTime(playerDur)}</span>
                  </div>
                </div>
              </div>
              <a href={track.youtube_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/20 text-[11px] hover:text-white/45 transition-colors w-fit">
                <ExternalLink size={10} />
                Ouvrir sur YouTube
              </a>
            </div>
          ) : (
            <p className="text-center text-white/20 text-sm italic py-2">Aucun lien audio disponible.</p>
          )}
        </div>

        {/* ─── Onglets ─── */}
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          hasParoles={hasLyrics}
          hasContexte={!!displayContext}
        />

        {/* ─── Contenu scrollable ─── */}
        <div className="flex-1 overflow-y-auto">

          {/* Paroles */}
          {activeTab === 'paroles' && (
            editingLyrics ? (
              <LyricsForm
                initialOriginal={displayLyricsOriginal ?? ''}
                initialFr={displayLyricsFr ?? ''}
                onSave={saveLyrics}
                onCancel={() => setEditingLyrics(false)}
              />
            ) : hasLyrics ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.3em]">Paroles</p>
                  <button onClick={() => setEditingLyrics(true)}
                    className="flex items-center gap-1 text-white/25 hover:text-white/60 text-[11px] transition-colors">
                    <PencilLine size={11} />Modifier
                  </button>
                </div>
                {displayLyricsFr && displayLyricsOriginal ? (
                  <LyricsSubTabs fr={displayLyricsFr} original={displayLyricsOriginal} />
                ) : displayLyricsOriginal ? (
                  <>
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">Fang</p>
                    <pre className="text-white/65 text-sm leading-8 whitespace-pre-wrap font-sans">{displayLyricsOriginal}</pre>
                  </>
                ) : (
                  <>
                    <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">Français</p>
                    <pre className="text-white/65 text-sm leading-8 whitespace-pre-wrap font-sans">{displayLyricsFr}</pre>
                  </>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<Music2 size={18} className="text-white/25" />}
                line1="Aucune parole pour ce titre."
                line2="Partage tes connaissances sur ce patrimoine."
                cta="Ajouter les paroles"
                onClick={() => setEditingLyrics(true)}
              />
            )
          )}

          {/* Contexte */}
          {activeTab === 'contexte' && (
            editingContext ? (
              <ContextForm
                initial={displayContext ?? ''}
                onSave={saveContext}
                onCancel={() => setEditingContext(false)}
              />
            ) : displayContext ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.3em]">À propos</p>
                  <button onClick={() => setEditingContext(true)}
                    className="flex items-center gap-1 text-white/25 hover:text-white/60 text-[11px] transition-colors">
                    <PencilLine size={11} />Modifier
                  </button>
                </div>
                <p className="text-white/65 text-sm leading-relaxed">{displayContext}</p>
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen size={18} className="text-white/25" />}
                line1="Aucun contexte pour ce titre."
                line2="Partage l'histoire de cette chanson."
                cta="Ajouter un contexte"
                onClick={() => setEditingContext(true)}
              />
            )
          )}

        </div>
      </div>
    </>
  );
}
