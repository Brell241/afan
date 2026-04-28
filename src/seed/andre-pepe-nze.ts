import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const ANDR_P_BIO = ``;

const ANDR_P_DISCOGRAPHY = [
  {
    title: "Principales œuvres",
    year: 2000,
    slug: 'principales-oeuvres',
    format: "Compilation YouTube",
    label: "",
    genre: "Folk-Pop Fang",
    description: "",
    credits: null,
    tracks: [
      { title: "Awou M'awou", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=bbEOzCxNu2o' },
      { title: "Edang Beyame", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=oOJ3HSAkI0Q' },
      { title: "Mbom Ntang", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=W9FPncDNjXI' },
      { title: "Nkoum Nzeghe", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=di5yNJvm0Jg' },
      { title: "Biyo Melene", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=AOFdSvRVE7U' },
      { title: "Fui", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=wxBv01E9S-c' },
      { title: "Endan'ayong", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=o4m7YRl4A6I' },
      { title: "Nkoum Elone", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=nOmeF8_fZGQ' },
      { title: "Andia", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=M0q9GOK-aR4' },
      { title: "Dzale", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=MJJYT_T13tw' },
      { title: "La cité s'en va", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=0fTr4D2Hb3k' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed André Pépé Nzé...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'André Pépé Nzé',
      slug: 'andre-pepe-nze',
      bio: ANDR_P_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: ANDR_P_BIO, name: 'André Pépé Nzé' } })
    .returning();

  console.log(`✅ Artiste : ${artist.name} (${artist.id})\n`);

  const existingAlbums = await db
    .select({ slug: albums.slug, image_url: albums.image_url })
    .from(albums)
    .where(eq(albums.artist_id, artist.id));
  const savedImageUrls: Record<string, string | null> = Object.fromEntries(
    existingAlbums.map((a) => [a.slug, a.image_url])
  );

  await db.delete(albums).where(eq(albums.artist_id, artist.id));

  for (const disc of ANDR_P_DISCOGRAPHY) {
    const [album] = await db
      .insert(albums)
      .values({
        artist_id: artist.id,
        title: disc.title,
        slug: disc.slug,
        year: disc.year,
        format: disc.format,
        label: disc.label,
        genre: disc.genre,
        description: disc.description,
        credits: disc.credits ?? null,
        image_url: savedImageUrls[disc.slug] ?? null,
      })
      .returning();

    const trackCount = disc.tracks.length;
    console.log(`  📀 ${disc.year} — ${disc.title} [${disc.format}] · ${disc.label}`);

    if (trackCount > 0) {
      await db.insert(tracks).values(
        disc.tracks.map((t) => ({
          album_id: album.id,
          title: t.title,
          track_number: t.track_number,
          duration: null,
          youtube_url: t.youtube_url ?? null,
          lyrics_fr: null,
          lyrics_original: null,
          context: null,
        }))
      );
      console.log(`     └ ${trackCount} titre(s)`);
    }
  }

  console.log('\n🌳 Seed terminé.');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch((err) => {
    console.error('Erreur seed :', err);
    process.exit(1);
  });
}
