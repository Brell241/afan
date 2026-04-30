'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X, Settings, Loader2, CheckCircle, AlertCircle,
  Play, Database, RotateCcw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'idle' | 'running' | 'preview' | 'seeding' | 'done' | 'error';

interface AlbumPreview {
  title: string;
  year: number;
  slug: string;
  format: string;
  label: string;
  genre: string;
  image_url: string | null;
  track_count: number;
}

interface Preview {
  artist_name: string;
  artist_slug: string;
  bio: string;
  born_year: number | null;
  death_year: number | null;
  albums: AlbumPreview[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function TermLine({ text }: { text: string }) {
  let cls = 'text-[#B3B3B3]';
  if (/✓|✅|🌱|🌳|🎵|📖|📝|📺/.test(text))   cls = 'text-[#1DB954]';
  else if (/✗|❌|Erreur/.test(text))           cls = 'text-red-400';
  else if (/⚠/.test(text))                     cls = 'text-yellow-400';
  else if (/^={3,}|Artiste\s*:/.test(text))    cls = 'text-white font-medium';
  else if (/^\s+→/.test(text))                  cls = 'text-[#535353]';

  return <div className={`font-mono text-xs leading-5 whitespace-pre-wrap break-all ${cls}`}>{text}</div>;
}

async function readSSE(
  url: string,
  body: object,
  onLog: (text: string) => void,
  onDone: (ev: { success: boolean; preview?: Preview }) => void,
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.body) throw new Error('No stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const ev = JSON.parse(line.slice(6));
          if (ev.type === 'log') onLog(ev.text as string);
          else if (ev.type === 'done') onDone(ev);
        } catch {}
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminPanel() {
  const [open, setOpen]       = useState(false);
  const [phase, setPhase]     = useState<Phase>('idle');
  const [logs, setLogs]       = useState<string[]>([]);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);

  const logsRef     = useRef<HTMLDivElement>(null);
  const seedLogsRef = useRef<HTMLDivElement>(null);

  // Form
  const [artistName, setArtistName]   = useState('');
  const [slug, setSlug]               = useState('');
  const [slugManual, setSlugManual]   = useState(false);
  const [ytChannel, setYtChannel]     = useState('');
  const [optImages, setOptImages]     = useState(true);
  const [optCloudinary, setOptCloud]  = useState(false);
  const [optDeepseek, setOptDeepseek] = useState(false);
  const [optNoYT, setOptNoYT]         = useState(false);

  useEffect(() => {
    logsRef.current?.scrollTo({ top: logsRef.current.scrollHeight });
  }, [logs]);

  useEffect(() => {
    seedLogsRef.current?.scrollTo({ top: seedLogsRef.current.scrollHeight });
  }, [seedLogs]);

  function handleNameChange(val: string) {
    setArtistName(val);
    if (!slugManual) setSlug(slugify(val));
  }

  async function handleResearch() {
    setPhase('running');
    setLogs([]);
    setPreview(null);
    try {
      await readSSE(
        '/api/admin/research',
        { artistName, slug, options: { ytChannel: ytChannel || null, images: optImages, cloudinary: optCloudinary, deepseek: optDeepseek, noYoutube: optNoYT } },
        (text) => setLogs(p => [...p, text]),
        (ev) => {
          if (ev.success && ev.preview) { setPreview(ev.preview); setPhase('preview'); }
          else setPhase('error');
        },
      );
    } catch { setPhase('error'); }
  }

  async function handleSeed() {
    setPhase('seeding');
    setSeedLogs([]);
    try {
      await readSSE(
        '/api/admin/seed',
        { slug },
        (text) => setSeedLogs(p => [...p, text]),
        (ev) => setPhase(ev.success ? 'done' : 'error'),
      );
    } catch { setPhase('error'); }
  }

  function reset() {
    setPhase('idle');
    setLogs([]);
    setSeedLogs([]);
    setPreview(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  const Terminal = ({ ref: r, lines, running }: { ref: React.RefObject<HTMLDivElement | null>; lines: string[]; running: boolean }) => (
    <div ref={r} className="bg-[#0a0a0a] rounded-xl p-4 h-72 overflow-y-auto border border-white/5 space-y-0.5">
      {lines.map((t, i) => <TermLine key={i} text={t} />)}
      {running && <span className="inline-block w-2 h-3.5 bg-[#1DB954] animate-pulse ml-0.5 align-middle" />}
    </div>
  );

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-colors"
        title="Admin — Ajouter un artiste"
      >
        <Settings size={20} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1DB954]" />
                <span className="text-white font-semibold text-sm">Admin — Nouvel artiste</span>
                {slug && phase !== 'idle' && (
                  <span className="text-[#535353] text-xs font-mono">/ {slug}</span>
                )}
              </div>
              <button onClick={close} className="text-[#535353] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">

              {/* ── FORMULAIRE ── */}
              {phase === 'idle' && (
                <form onSubmit={e => { e.preventDefault(); handleResearch(); }} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[#B3B3B3] text-xs font-medium uppercase tracking-wide">
                      Nom de l&apos;artiste <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={artistName}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="ex: Annie-Flore Batchiellilys"
                      className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-[#535353] focus:outline-none focus:border-[#1DB954] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#B3B3B3] text-xs font-medium uppercase tracking-wide">
                      Slug DB <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={slug}
                      onChange={e => { setSlugManual(true); setSlug(e.target.value); }}
                      placeholder="ex: annie-flore-batchiellilys"
                      className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-[#535353] font-mono focus:outline-none focus:border-[#1DB954] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#B3B3B3] text-xs font-medium uppercase tracking-wide">
                      Chaîne YouTube <span className="text-[#535353] normal-case font-normal">(optionnel — si absent de Discogs)</span>
                    </label>
                    <input
                      value={ytChannel}
                      onChange={e => setYtChannel(e.target.value)}
                      placeholder="ex: @APN245"
                      className="w-full bg-[#282828] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-[#535353] font-mono focus:outline-none focus:border-[#1DB954] transition-colors"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-[#B3B3B3] text-xs font-medium uppercase tracking-wide">Options</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { label: 'Pochettes',    desc: 'Discogs + YouTube thumbnail',   val: optImages,     set: setOptImages },
                        { label: 'Cloudinary',   desc: 'Upload 600×600 WebP',           val: optCloudinary, set: setOptCloud },
                        { label: 'DeepSeek AI',  desc: 'Bio reformulée + genres',       val: optDeepseek,   set: setOptDeepseek },
                        { label: 'Sans YouTube', desc: 'Désactiver les URLs vidéo',     val: optNoYT,       set: setOptNoYT },
                      ] as const).map(({ label, desc, val, set }) => (
                        <label
                          key={label}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            val ? 'bg-[#1DB954]/10 border-[#1DB954]/40' : 'bg-[#282828] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={val}
                            onChange={e => set(e.target.checked as never)}
                            className="mt-0.5 accent-[#1DB954]"
                          />
                          <div>
                            <p className={`text-xs font-medium ${val ? 'text-[#1DB954]' : 'text-white'}`}>{label}</p>
                            <p className="text-[#535353] text-xs">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!artistName || !slug}
                    className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm py-3.5 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={14} />
                    Lancer la recherche
                  </button>
                </form>
              )}

              {/* ── TERMINAL RECHERCHE ── */}
              {(phase === 'running' || (phase === 'error' && logs.length > 0)) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {phase === 'running'
                      ? <><Loader2 size={13} className="text-[#1DB954] animate-spin" /><span className="text-[#1DB954] text-xs">Recherche en cours…</span></>
                      : <><AlertCircle size={13} className="text-red-400" /><span className="text-red-400 text-xs">Erreur — voir le terminal</span></>
                    }
                  </div>
                  <Terminal ref={logsRef} lines={logs} running={phase === 'running'} />
                  {phase === 'error' && (
                    <button onClick={reset} className="flex items-center gap-2 text-[#B3B3B3] hover:text-white text-xs transition-colors">
                      <RotateCcw size={13} /> Recommencer
                    </button>
                  )}
                </div>
              )}

              {/* ── PREVIEW ── */}
              {phase === 'preview' && preview && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-[#1DB954]" />
                    <span className="text-[#1DB954] text-xs font-medium">
                      Données collectées — vérifiez avant de seeder
                    </span>
                  </div>

                  {/* Artiste */}
                  <div className="bg-[#282828] rounded-xl p-4 space-y-2">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="text-white font-bold">{preview.artist_name}</h3>
                      {(preview.born_year || preview.death_year) && (
                        <span className="text-[#535353] text-xs">
                          {preview.born_year ?? '?'}{preview.death_year ? ` — ${preview.death_year}` : ''}
                        </span>
                      )}
                    </div>
                    {preview.bio
                      ? <p className="text-[#B3B3B3] text-xs leading-relaxed line-clamp-4">{preview.bio}</p>
                      : <p className="text-[#535353] text-xs italic">Aucune biographie trouvée</p>
                    }
                  </div>

                  {/* Albums */}
                  <div>
                    <p className="text-[#B3B3B3] text-xs uppercase tracking-wide mb-3">
                      {preview.albums.length} album{preview.albums.length !== 1 ? 's' : ''}
                      {' · '}
                      {preview.albums.reduce((s, a) => s + a.track_count, 0)} titres
                      {' · '}
                      {preview.albums.filter(a => a.image_url).length} pochettes
                    </p>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                      {preview.albums.map(a => (
                        <div key={a.slug} className="flex items-center gap-3 bg-[#282828] hover:bg-[#303030] rounded-lg px-3 py-2 transition-colors">
                          {a.image_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={a.image_url} alt={a.title} className="w-10 h-10 rounded object-cover flex-shrink-0 bg-[#383838]" />
                            : <div className="w-10 h-10 rounded bg-[#383838] flex-shrink-0 flex items-center justify-center text-[#535353] text-xs">—</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{a.title}</p>
                            <p className="text-[#535353] text-xs truncate">
                              {a.year}
                              {a.format ? ` · ${a.format}` : ''}
                              {a.label  ? ` · ${a.label}`  : ''}
                              {' · '}
                              <span className="text-[#B3B3B3]">{a.track_count} titre{a.track_count !== 1 ? 's' : ''}</span>
                            </p>
                          </div>
                          {a.genre && (
                            <span className="text-[#1DB954] text-xs truncate max-w-[90px] flex-shrink-0">{a.genre}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={reset}
                      className="flex-1 bg-[#282828] hover:bg-[#383838] text-[#B3B3B3] hover:text-white text-sm font-medium py-3 rounded-full transition-colors"
                    >
                      Recommencer
                    </button>
                    <button
                      onClick={handleSeed}
                      className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                    >
                      <Database size={14} />
                      Confirmer et seeder
                    </button>
                  </div>
                </div>
              )}

              {/* ── TERMINAL SEED ── */}
              {phase === 'seeding' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 size={13} className="text-[#1DB954] animate-spin" />
                    <span className="text-[#1DB954] text-xs">Seed en cours…</span>
                  </div>
                  <Terminal ref={seedLogsRef} lines={seedLogs} running />
                </div>
              )}

              {/* ── SUCCÈS ── */}
              {phase === 'done' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#1DB954]" />
                    <span className="text-[#1DB954] font-semibold text-sm">
                      {preview?.artist_name ?? artistName} ajouté avec succès !
                    </span>
                  </div>
                  <Terminal ref={seedLogsRef} lines={seedLogs} running={false} />
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="flex-1 bg-[#282828] hover:bg-[#383838] text-[#B3B3B3] hover:text-white text-sm font-medium py-3 rounded-full transition-colors"
                    >
                      Ajouter un autre
                    </button>
                    <button
                      onClick={close}
                      className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm py-3 rounded-full transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
