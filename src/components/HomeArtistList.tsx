'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  avatar_url: string | null;
}

export function HomeArtistList({ artists }: { artists: Artist[] }) {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <h2 className="text-white font-bold text-2xl mb-6">Les arbres de la forêt</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
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
    </section>
  );
}
