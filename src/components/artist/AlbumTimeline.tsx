'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';
import type { Album } from '@/db/schema';

interface AlbumTimelineProps {
  albums: Album[];
  artistSlug: string;
}

export function AlbumTimeline({ albums, artistSlug }: AlbumTimelineProps) {
  const sorted = [...albums].sort((a, b) => a.year - b.year);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Grouper par décennie
  const grouped = sorted.reduce<Record<string, Album[]>>((acc, album) => {
    const decade = Math.floor(album.year / 10) * 10;
    const label = `Années ${decade}`;
    if (!acc[label]) acc[label] = [];
    acc[label].push(album);
    return acc;
  }, {});

  const decadeEntries = Object.entries(grouped);

  return (
    <section className="px-8 py-10">
      {/* En-tête */}
      <div className="mb-10">
        <h2 className="text-white font-bold text-lg tracking-tight">Discographie</h2>
        <p className="text-[#484848] text-[11px] mt-1 font-mono tracking-wide">
          {sorted.length} albums · {sorted[0]?.year} – {sorted[sorted.length - 1]?.year}
        </p>
      </div>

      {/* Groupes par décennie */}
      <div className="flex flex-col gap-14">
        {decadeEntries.map(([decade, decadeAlbums]) => (
          <div key={decade}>
            {/* En-tête décennie */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#3a3a3a] text-[10px] font-bold uppercase tracking-[0.22em] shrink-0">
                {decade}
              </span>
              <div className="flex-1 h-px bg-white/[0.04]" />
            </div>

            {/* Grille albums */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-7">
              {decadeAlbums.map((album) => (
                <Link
                  key={album.id}
                  href={`/artist/${artistSlug}/album/${album.slug}`}
                  className="group flex flex-col gap-3"
                  onMouseEnter={() => setHoveredId(album.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Pochette */}
                  <div className="relative aspect-square rounded-[3px] overflow-hidden bg-[#141414] shadow-md">
                    {album.image_url ? (
                      <Image
                        src={album.image_url}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-end p-3.5 bg-gradient-to-br from-[#1e1e1e] to-[#0f0f0f]">
                        <span className="text-white/8 font-black text-[2.5rem] leading-none tabular-nums select-none">
                          {album.year}
                        </span>
                      </div>
                    )}

                    {/* Overlay sombre au hover */}
                    <div
                      className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
                        hoveredId === album.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Bouton play */}
                    <div
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#1DB954] shadow-lg shadow-black/40 flex items-center justify-center transition-all duration-200 ${
                        hoveredId === album.id
                          ? 'opacity-100 translate-y-0 scale-100'
                          : 'opacity-0 translate-y-2 scale-90'
                      }`}
                    >
                      <Play size={14} fill="black" className="text-black ml-0.5" />
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="min-w-0">
                    <p className="text-[#d0d0d0] text-[13px] font-semibold leading-snug truncate group-hover:text-white transition-colors">
                      {album.title}
                    </p>
                    <p className="text-[#484848] text-[11px] mt-0.5 font-mono flex items-center gap-1.5">
                      <span>{album.year}</span>
                      {album.format && (
                        <>
                          <span className="text-[#2e2e2e]">·</span>
                          <span>{album.format}</span>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
