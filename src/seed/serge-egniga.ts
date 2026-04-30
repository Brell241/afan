import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const SERGE_EGNIGA_BIO = ``;

const SERGE_EGNIGA_DISCOGRAPHY = [
  {
    title: "Principales œuvres",
    year: 2000,
    slug: 'principales-oeuvres',
    format: "Compilation YouTube",
    label: "",
    genre: "",
    description: "",
    credits: null,
    image_url: 'https://i.ytimg.com/vi/taxvDpNTC_Q/hqdefault.jpg',
    tracks: [
      { title: "Artistes gabonais", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=taxvDpNTC_Q' },
      { title: "Lembaréni, ntsé yazo", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=o8hxQ7oMjvI' },
      { title: "Iñino", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Vx3sHFr5kX0' },
      { title: "Ignino", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=1Tk_9XmQAtk' },
      { title: "Serges Egniga - Où va la vie", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=cR3KLRj_RyE' },
      { title: "G'ALONGA - Traduction", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=sDStQ6kP0Gg' },
      { title: "Souvenirs", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=oBlw4RjpghM' },
      { title: "Evowa.", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=qYdcVjiCUPM' },
      { title: "Tonda", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=U14Y1yE9FjY' },
      { title: "Itónda", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=1AgpJswhuuc' },
      { title: "Inongo Ayilé Traduction", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=QIl-rhBTCnA' },
      { title: "Noir d'eben", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=pZe9DFd6N_g' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Serge Egniga...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Serge Egniga',
      slug: 'serge-egniga',
      bio: SERGE_EGNIGA_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: SERGE_EGNIGA_BIO, name: 'Serge Egniga' } })
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

  for (const disc of SERGE_EGNIGA_DISCOGRAPHY) {
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
