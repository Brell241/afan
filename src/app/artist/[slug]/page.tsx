import { notFound } from 'next/navigation';
import { eq, ne, sql } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/db';
import { artists, albums } from '@/db/schema';
import { Radio } from 'lucide-react';
import { ArtistNav } from '@/components/artist/ArtistNav';
import { ArtistHeader } from '@/components/artist/ArtistHeader';
import { ArtistSidebar } from '@/components/artist/ArtistSidebar';
import { AlbumTimeline } from '@/components/artist/AlbumTimeline';

export async function generateStaticParams() {
  if (!process.env.DATABASE_URL) return [];
  try {
    const all = await db.select({ slug: artists.slug }).from(artists);
    return all.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!process.env.DATABASE_URL) notFound();

  const [artist] = await db.select().from(artists).where(eq(artists.slug, slug));
  if (!artist) notFound();

  const artistAlbums = await db.select().from(albums).where(eq(albums.artist_id, artist.id));

  const years = artistAlbums.map((a) => a.year).filter(Boolean) as number[];
  const yearStart = years.length ? Math.min(...years) : null;
  const yearEnd = years.length ? Math.max(...years) : null;

  const related = await db
    .select({ id: artists.id, name: artists.name, slug: artists.slug, avatar_url: artists.avatar_url, photo_url: artists.photo_url })
    .from(artists)
    .where(ne(artists.id, artist.id))
    .orderBy(sql`RANDOM()`)
    .limit(3);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <ArtistNav name={artist.name} heroHeight={460} />

      <div>
        {/* Hero parallax — commence sous la nav transparente */}
        <ArtistHeader
          id={artist.id}
          name={artist.name}
          photo_url={artist.photo_url}
        />

        {/* Bandeau d'information */}
        <div className="flex items-center gap-2.5 px-8 py-2.5 border-b border-white/[0.04] bg-[#0d0d0d]">
          <Radio size={12} className="text-white/20 shrink-0" />
          <p className="text-white/25 text-[11px] tracking-wide">
            Aucune musique n&apos;est hébergée sur cette plateforme — tous les titres sont diffusés depuis YouTube.
          </p>
        </div>

        {/* Layout deux colonnes */}
        <div className="flex flex-col lg:flex-row">
          <ArtistSidebar
            id={artist.id}
            name={artist.name}
            bio={artist.bio}
            avatar_url={artist.avatar_url}
            albumCount={artistAlbums.length}
            yearStart={yearStart}
            yearEnd={yearEnd}
            death_year={artist.death_year}
          />

          {/* Contenu principal — prend tout l'espace restant */}
          <div className="flex-1 min-w-0">
            <AlbumTimeline albums={artistAlbums} artistSlug={artist.slug} />
          </div>
        </div>

        {/* Artistes à découvrir */}
        {related.length > 0 && (
          <footer className="px-8 py-10 border-t border-white/[0.04]">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              À découvrir
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {related.map((a) => {
                const img = a.avatar_url ?? a.photo_url;
                return (
                  <Link
                    key={a.id}
                    href={`/artist/${a.slug}`}
                    className="group flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] hover:border-white/[0.09] transition-all"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      {img ? (
                        <Image src={img} alt={a.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
                      )}
                    </div>
                    <span className="text-white/60 text-sm font-medium group-hover:text-white/90 transition-colors truncate">
                      {a.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
