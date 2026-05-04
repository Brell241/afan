'use client';

import { useState, useRef, useEffect } from 'react';
import { ListPlus, Plus, Loader2, Check } from 'lucide-react';
import { useLibrary } from '@/lib/library-context';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

interface AddToPlaylistButtonProps {
  trackId: string;
  className?: string;
}

export function AddToPlaylistButton({ trackId, className }: AddToPlaylistButtonProps) {
  const { data: session } = useSession();
  const { playlists, createPlaylist, addToPlaylist, showAuthModal } = useLibrary();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!session?.user) { showAuthModal(); return; }
    setOpen((v) => !v);
  }

  async function handleAdd(playlistId: string) {
    setAdded(playlistId);
    await addToPlaylist(playlistId, trackId);
    toast.success('Titre ajouté à la playlist.');
    setTimeout(() => { setAdded(null); setOpen(false); }, 800);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const playlist = await createPlaylist(newName.trim());
      await addToPlaylist(playlist.id, trackId);
      toast.success(`Playlist "${playlist.name}" créée.`);
      setNewName('');
      setCreating(false);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleToggle}
        aria-label="Ajouter à une playlist"
        className={className}
      >
        <ListPlus size={15} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1e1e1e] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50">
          <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Playlists
          </p>

          {playlists.length === 0 && !creating && (
            <p className="px-3 py-2 text-white/35 text-xs">Aucune playlist pour l&apos;instant.</p>
          )}

          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAdd(p.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors text-left"
            >
              <span className="truncate">{p.name}</span>
              {added === p.id ? (
                <Check size={13} className="shrink-0 text-[#1DB954]" />
              ) : (
                <span className="text-white/25 text-[10px] shrink-0">{p.trackCount}</span>
              )}
            </button>
          ))}

          <div className="border-t border-white/[0.07] mt-1">
            {creating ? (
              <form onSubmit={handleCreate} className="p-2 flex gap-1.5">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom de la playlist"
                  className="flex-1 bg-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20 min-w-0"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="shrink-0 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  {saving ? <Loader2 size={11} className="animate-spin text-white/60" /> : <Check size={11} className="text-white/70" />}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/45 hover:text-white/80 hover:bg-white/[0.05] transition-colors"
              >
                <Plus size={13} />
                Nouvelle playlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
