'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Album } from '@/db/schema';

interface AlbumTimelineProps {
  albums: Album[];
  artistSlug: string;
}

export function AlbumTimeline({ albums, artistSlug }: AlbumTimelineProps) {
  const sorted = [...albums].sort((a, b) => a.year - b.year);

  return (
    <section className="py-16 bg-[#0d1a0d]">
      <div className="container mx-auto px-6 mb-8">
        <h2 className="text-2xl font-serif text-white/90 mb-1">Discographie</h2>
        <p className="text-[#4a7c59] text-sm tracking-widest uppercase">Les anneaux de l'arbre</p>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-6 px-6 pb-6 min-w-max">
          {sorted.map((album, idx) => (
            <Link
              key={album.id}
              href={`/artist/${artistSlug}/album/${album.slug}`}
              className="group flex flex-col items-center gap-3 w-44 shrink-0"
            >
              {/* Carte album */}
              <div className="relative w-44 h-44 rounded-lg overflow-hidden bg-[#1a2e1a] border border-[#2a4a2a] group-hover:border-[#4a7c59] transition-colors">
                {album.image_url ? (
                  <Image src={album.image_url} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-20 select-none">🌿</span>
                  </div>
                )}
                {/* Année */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <span className="text-[#a3c9a8] text-xs font-mono">{album.year}</span>
                </div>
              </div>

              {/* Ligne de temps */}
              <div className="flex items-center w-full">
                <div className="h-px flex-1 bg-[#2a4a2a] group-hover:bg-[#4a7c59] transition-colors" />
                <div className="w-2 h-2 rounded-full bg-[#4a7c59] mx-1 shrink-0" />
                <div className="h-px flex-1 bg-[#2a4a2a] group-hover:bg-[#4a7c59] transition-colors" />
              </div>

              <div className="text-center">
                <p className="text-white/80 text-sm font-medium leading-snug group-hover:text-white transition-colors">
                  {album.title}
                </p>
                {album.genre && (
                  <p className="text-[#4a7c59] text-xs mt-1 truncate">{album.genre}</p>
                )}
              </div>

              <span className="text-[#2a4a2a] text-xs font-mono">#{idx + 1}</span>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-[#1a2e1a]" />
      </ScrollArea>
    </section>
  );
}
