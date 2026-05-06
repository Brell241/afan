'use client';

import { useState } from 'react';
import { X, User, Disc3, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { useLibrary } from '@/lib/library-context';

interface AddRequestModalProps {
  open: boolean;
  onClose: () => void;
  existingArtists?: { id: string; name: string }[];
}

type Tab = 'artist' | 'album';
type Step = 'form' | 'done';

export function AddRequestModal({ open, onClose, existingArtists = [] }: AddRequestModalProps) {
  const { data: session } = useSession();
  const { showAuthModal } = useLibrary();
  const [tab, setTab] = useState<Tab>('artist');
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);

  // Artiste
  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [artistBorn, setArtistBorn] = useState('');
  const [artistDeath, setArtistDeath] = useState('');

  // Album
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumArtistId, setAlbumArtistId] = useState('');
  const [albumArtistFree, setAlbumArtistFree] = useState('');
  const [albumYear, setAlbumYear] = useState('');
  const [albumLabel, setAlbumLabel] = useState('');
  const [albumFormat, setAlbumFormat] = useState('');

  if (!open) return null;

  function resetForm() {
    setArtistName(''); setArtistBio(''); setArtistBorn(''); setArtistDeath('');
    setAlbumTitle(''); setAlbumArtistId(''); setAlbumArtistFree(''); setAlbumYear(''); setAlbumLabel(''); setAlbumFormat('');
    setStep('form');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { showAuthModal(); return; }

    setLoading(true);
    try {
      let body: Record<string, unknown>;

      if (tab === 'artist') {
        if (!artistName.trim()) { toast.error('Le nom est requis.'); return; }
        body = {
          type: 'add_artist',
          content: artistName.trim(),
          extra: JSON.stringify({
            name: artistName.trim(),
            bio: artistBio.trim() || undefined,
            born_year: artistBorn ? Number(artistBorn) : undefined,
            death_year: artistDeath ? Number(artistDeath) : undefined,
          }),
        };
      } else {
        if (!albumTitle.trim() || !albumYear) { toast.error('Titre et année sont requis.'); return; }
        body = {
          type: 'add_album',
          content: albumTitle.trim(),
          artist_id: albumArtistId || undefined,
          extra: JSON.stringify({
            title: albumTitle.trim(),
            year: Number(albumYear),
            label: albumLabel.trim() || undefined,
            format: albumFormat || undefined,
            artist_name: albumArtistId
              ? existingArtists.find((a) => a.id === albumArtistId)?.name
              : albumArtistFree.trim() || undefined,
          }),
        };
      }

      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      setStep('done');
    } catch {
      toast.error('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-white/[0.08] shadow-2xl p-6">
        <button onClick={handleClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors">
          <X size={16} />
        </button>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 size={40} className="text-[#1DB954]" />
            <div>
              <p className="text-white font-semibold">Demande envoyée !</p>
              <p className="text-white/45 text-sm mt-1">L'admin va examiner ta proposition.</p>
            </div>
            <button onClick={handleClose} className="px-5 py-2 rounded-full bg-white/[0.08] text-white/60 text-sm hover:bg-white/[0.15] transition-all">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Proposer un ajout</p>
              <h2 className="text-white font-bold text-lg">Enrichir le catalogue</h2>
              <p className="text-white/40 text-sm mt-1">L'admin validera ta proposition avant publication.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-white/[0.05] rounded-xl">
              {([['artist', 'Artiste', User], ['album', 'Album', Disc3]] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === id ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {tab === 'artist' ? (
                <>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Nom de l'artiste *</label>
                    <input value={artistName} onChange={(e) => setArtistName(e.target.value)} required
                      placeholder="Ex : Patience Dabany"
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Biographie courte</label>
                    <textarea value={artistBio} onChange={(e) => setArtistBio(e.target.value)} rows={3}
                      placeholder="Quelques mots sur l'artiste…"
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Année de naissance</label>
                      <input value={artistBorn} onChange={(e) => setArtistBorn(e.target.value)} type="number" min="1900" max="2010"
                        placeholder="Ex : 1948"
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Année de décès</label>
                      <input value={artistDeath} onChange={(e) => setArtistDeath(e.target.value)} type="number" min="1900" max="2030"
                        placeholder="si décédé"
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Titre de l'album *</label>
                    <input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} required
                      placeholder="Ex : Ma liberté"
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Artiste</label>
                    {existingArtists.length > 0 ? (
                      <select value={albumArtistId} onChange={(e) => setAlbumArtistId(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-white/30 transition-colors appearance-none">
                        <option value="">— Artiste non listé —</option>
                        {existingArtists.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input value={albumArtistFree} onChange={(e) => setAlbumArtistFree(e.target.value)}
                        placeholder="Nom de l'artiste"
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Année *</label>
                      <input value={albumYear} onChange={(e) => setAlbumYear(e.target.value)} required type="number" min="1940" max="2030"
                        placeholder="Ex : 1984"
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">Format</label>
                      <select value={albumFormat} onChange={(e) => setAlbumFormat(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-white/30 transition-colors appearance-none">
                        <option value="">—</option>
                        <option>Album</option>
                        <option>EP</option>
                        <option>Single</option>
                        <option>Live</option>
                        <option>Compilation</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Label / maison de disques</label>
                    <input value={albumLabel} onChange={(e) => setAlbumLabel(e.target.value)}
                      placeholder="Ex : Celluloid Records"
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all disabled:opacity-60 mt-1">
                {loading ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Envoyer la proposition'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
