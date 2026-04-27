import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Album, Artist } from '@/db/schema';

interface AlbumHeroProps {
  album: Album;
  artist: Artist;
}

export function AlbumHero({ album, artist }: AlbumHeroProps) {
  return (
    <div className="relative bg-[#0d1a0d] border-b border-[#1a2e1a]">
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-start">
        {/* Visuel album */}
        <div className="relative w-52 h-52 shrink-0 rounded-lg overflow-hidden bg-[#1a2e1a] border border-[#2a4a2a] shadow-2xl">
          {album.image_url ? (
            <Image src={album.image_url} alt={album.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-6xl opacity-10">🌿</span>
              <span className="text-[#2a4a2a] text-xs">{album.year}</span>
            </div>
          )}
        </div>

        {/* Métadonnées */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/artist/${artist.slug}`}
            className="text-[#4a7c59] text-sm hover:text-[#a3c9a8] transition-colors"
          >
            ← {artist.name}
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white font-serif">{album.title}</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="bg-[#1a2e1a] text-[#a3c9a8] border-[#2a4a2a] hover:bg-[#1a2e1a]">
              {album.year}
            </Badge>
            {album.genre && (
              <Badge variant="outline" className="border-[#2a4a2a] text-white/50">
                {album.genre}
              </Badge>
            )}
            {album.label && (
              <Badge variant="outline" className="border-[#2a4a2a] text-white/50">
                {album.label}
              </Badge>
            )}
          </div>

          {album.description && (
            <p className="text-white/60 max-w-xl text-sm leading-relaxed mt-2">
              {album.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
