'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, Users, X } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  avatar_url: string | null;
}

export function HomeArtistList({ artists }: { artists: Artist[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return artists;
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [artists, query]);

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-white font-bold text-2xl">Les arbres de la forêt</h2>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un artiste…"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-full pl-8 pr-8 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/20">
          <Search size={32} className="mb-3" />
          <p className="text-sm">Aucun artiste trouvé pour « {query} »</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.slug}`}
              className="group flex items-center gap-4 p-4 rounded-lg bg-[#181818] hover:bg-[#282828] transition-colors"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#282828] flex items-center justify-center">
                {(artist.avatar_url ?? artist.photo_url) ? (
                  <Image
                    src={(artist.avatar_url ?? artist.photo_url)!}
                    alt={artist.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Users size={24} className="text-[#B3B3B3]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{artist.name}</p>
                <p className="text-[#B3B3B3] text-xs mt-0.5 truncate">
                  {artist.bio ? artist.bio.slice(0, 50) + '…' : 'Patrimoine Gabonais'}
                </p>
              </div>

              <ArrowRight size={16} className="text-[#B3B3B3] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {query && filtered.length > 0 && (
        <p className="text-white/20 text-xs mt-4 text-center">
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour « {query} »
        </p>
      )}
    </section>
  );
}
