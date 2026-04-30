import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const EVIZO_STARS_BIO = ``;

const EVIZO_STARS_DISCOGRAPHY = [
  {
    title: "V.I.P.",
    year: 1996,
    slug: 'v-i-p',
    format: "CD",
    label: "Blue Silver Distribution (50492-2)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    image_url: 'https://res.cloudinary.com/ddymfjzpi/image/upload/v1777583402/afan/albums/v-i-p.jpg',
    tracks: [
      { title: "Fusion", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=LKxbQ4DyTAY' },
      { title: "Soleil De Minuit", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=gFsRCAtasyw' },
      { title: "Mone Fam", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=CzS1GbiM2j8' },
      { title: "Séparé", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=PMtW1FUQiq4' },
      { title: "O'Mwana", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=CrQ5jwFVhTE' },
      { title: "Zika Mi Ndélé", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=LKxbQ4DyTAY' },
      { title: "Matasse", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=T_1rAF8x1a0' },
      { title: "Allô !", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=okJKLmwzvD8' },
      { title: "Niulilu (Ecoute Moi)", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=SAu0rOObLPs' },
      { title: "Nkombe", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=rKiRUE0LkS0' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Evizo Stars...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Evizo Stars',
      slug: 'evizo-stars',
      bio: EVIZO_STARS_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: EVIZO_STARS_BIO, name: 'Evizo Stars' } })
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

  for (const disc of EVIZO_STARS_DISCOGRAPHY) {
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
        image_url: savedImageUrls[disc.slug] ?? disc.image_url ?? null,
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
