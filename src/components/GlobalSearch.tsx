'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Music2, Disc3, Users, Calendar } from 'lucide-react';

interface SearchArtist { id: string; name: string; slug: string; avatar_url: string | null; photo_url: string | null }
interface SearchAlbum  { id: string; title: string; slug: string; year: number; format: string | null; image_url: string | null; artist: { name: string; slug: string } | null }
interface SearchTrack  { id: string; title: string; youtube_url: string | null; album: { slug: string; title: string; artist: { name: string; slug: string } } }
interface Results { artists: SearchArtist[]; albums: SearchAlbum[]; tracks: SearchTrack[] }

const EMPTY: Results = { artists: [], albums: [], tracks: [] };

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(''); setResults(EMPTY); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 2) { setResults(EMPTY); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
      } catch { setResults(EMPTY); }
      finally { setLoading(false); }
    }, 260);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  function navigate(href: string) { onClose(); router.push(href); }

  const hasResults = results.artists.length + results.albums.length + results.tracks.length > 0;
  const showEmpty = query.trim().length >= 2 && !loading && !hasResults;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl mx-auto mt-[10vh] bg-[#1a1a1a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
          {loading
            ? <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin shrink-0" />
            : <Search size={16} className="text-white/30 shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artiste, album, chanson, année…"
            className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/20 hover:text-white/50 transition-colors">
              <X size={15} />
            </button>
          )}
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors ml-1 text-xs font-mono border border-white/10 rounded px-1.5 py-0.5">
            Esc
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.artists.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                <Users size={9} /> Artistes
              </p>
              {results.artists.map((a) => {
                const img = a.avatar_url ?? a.photo_url;
                return (
                  <button key={a.id} onClick={() => navigate(`/artist/${a.slug}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                      {img ? <Image src={img} alt={a.name} width={32} height={32} className="object-cover w-full h-full" />
                             : <Users size={14} className="text-white/20" />}
                    </div>
                    <span className="text-white/80 text-sm font-medium">{a.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {results.albums.length > 0 && (
            <div className="py-2 border-t border-white/[0.05]">
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                <Disc3 size={9} /> Albums
              </p>
              {results.albums.map((a) => (
                <button key={a.id} onClick={() => a.artist && navigate(`/artist/${a.artist.slug}/album/${a.slug}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                  <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                    {a.image_url ? <Image src={a.image_url} alt={a.title} width={32} height={32} className="object-cover w-full h-full" />
                                 : <Disc3 size={14} className="text-white/20" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{a.title}</p>
                    <p className="text-white/30 text-xs truncate">
                      {a.artist?.name}{a.year ? ` · ${a.year}` : ''}{a.format ? ` · ${a.format}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.tracks.length > 0 && (
            <div className="py-2 border-t border-white/[0.05]">
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                <Music2 size={9} /> Chansons
              </p>
              {results.tracks.map((t) => (
                <button key={t.id} onClick={() => navigate(`/artist/${t.album.artist.slug}/album/${t.album.slug}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                  <div className="w-8 h-8 rounded-sm shrink-0 bg-white/5 flex items-center justify-center">
                    <Music2 size={14} className="text-white/20" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{t.title}</p>
                    <p className="text-white/30 text-xs truncate">{t.album.artist.name} · {t.album.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-white/20 gap-2">
              <Search size={24} />
              <p className="text-sm">Aucun résultat pour « {query} »</p>
            </div>
          )}

          {query.trim().length < 2 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/15">
              <div className="flex gap-6 text-xs">
                <span className="flex items-center gap-1.5"><Users size={11} /> Artistes</span>
                <span className="flex items-center gap-1.5"><Disc3 size={11} /> Albums</span>
                <span className="flex items-center gap-1.5"><Music2 size={11} /> Chansons</span>
                <span className="flex items-center gap-1.5"><Calendar size={11} /> Années</span>
              </div>
              <p className="text-xs">Tapez au moins 2 caractères</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-white/15 text-[10px] font-mono">⌘K · Esc</span>
          {hasResults && (
            <span className="text-white/15 text-[10px]">
              {results.artists.length + results.albums.length + results.tracks.length} résultats
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
