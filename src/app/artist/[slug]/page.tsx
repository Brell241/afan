import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { artists, albums } from '@/db/schema';
import { ArtistHeader } from '@/components/artist/ArtistHeader';
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

  return (
    <main className="min-h-screen bg-[#0d1a0d]">
      <ArtistHeader
        name={artist.name}
        bio={artist.bio}
        photo_url={artist.photo_url}
        albumCount={artistAlbums.length}
      />
      <AlbumTimeline albums={artistAlbums} artistSlug={artist.slug} />

      {/* Section à propos */}
      <section className="container mx-auto px-6 py-16 max-w-2xl">
        <div className="border-t border-[#1a2e1a] pt-10">
          <h2 className="text-lg font-serif text-[#4a7c59] mb-4">À propos d'Afan</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Afan — "La Forêt" en Fang — est un sanctuaire numérique open-source dédié à la
            préservation du patrimoine musical gabonais. Chaque artiste est un arbre. Chaque
            contribution est une racine supplémentaire. Rejoins la forêt.
          </p>
        </div>
      </section>
    </main>
  );
}
