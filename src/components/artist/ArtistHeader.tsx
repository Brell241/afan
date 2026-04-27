import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface ArtistHeaderProps {
  name: string;
  bio: string | null;
  photo_url: string | null;
  albumCount: number;
}

export function ArtistHeader({ name, bio, photo_url, albumCount }: ArtistHeaderProps) {
  return (
    <header className="relative w-full min-h-[60vh] flex items-end overflow-hidden bg-[#0d1a0d]">
      {/* Fond végétal */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a7c59' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient bas */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a0d] via-[#0d1a0d]/60 to-transparent" />

      {/* Photo artiste */}
      {photo_url && (
        <div className="absolute inset-0">
          <Image src={photo_url} alt={name} fill className="object-cover object-top opacity-40" />
        </div>
      )}

      {/* Contenu */}
      <div className="relative z-10 container mx-auto px-6 pb-12 pt-24">
        <Badge className="mb-4 bg-[#4a7c59]/30 text-[#a3c9a8] border-[#4a7c59] hover:bg-[#4a7c59]/40">
          Patrimoine Musical Gabonais
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 font-serif">
          {name}
        </h1>

        <p className="text-[#a3c9a8] text-sm uppercase tracking-widest mb-6">
          {albumCount} albums · 1970 — 2005
        </p>

        {bio && (
          <p className="text-white/70 max-w-2xl text-base leading-relaxed">
            {bio}
          </p>
        )}
      </div>
    </header>
  );
}
