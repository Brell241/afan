import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const OLIVER_N_BIO = `Oliver Ngoma, dit Noli, né le 23 mars 1959 à Mayumba et mort le 7 juin 2010 à Libreville, est un chanteur et guitariste gabonais d'afro-zouk en langue Lumbu et villi`;

const OLIVER_N_DISCOGRAPHY = [
  {
    title: "Bane",
    year: 1990,
    slug: 'bane',
    format: "CD",
    label: "Sonodisc (CD 53171)",
    genre: "Afro-Zouk",
    description: "",
    credits: 'Production & Arrangements : Manu Lima',
    tracks: [
      { title: "Mayumba", track_number: 1, youtube_url: null },
      { title: "Bane", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=J8UdLgTinM8' },
      { title: "Alphonsine", track_number: 3, youtube_url: null },
      { title: "Icole", track_number: 4, youtube_url: null },
      { title: "Lili", track_number: 5, youtube_url: null },
      { title: "Lusa", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=JHs-8u-3ai8' },
      { title: "Julie", track_number: 7, youtube_url: null },
      { title: "Mugetu Gole", track_number: 8, youtube_url: null },
    ],
  },
  {
    title: "Adia",
    year: 1995,
    slug: 'adia',
    format: "CD",
    label: "Lusafrica (26289-2)",
    genre: "Afro-Zouk",
    description: "",
    credits: 'Production : Manu Lima',
    tracks: [
      { title: "Adia", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=h_HYQZq9ZEY' },
      { title: "Nge Spirit", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=KYMOXt6nO_E' },
      { title: "Nge", track_number: 3, youtube_url: null },
      { title: "Barre", track_number: 4, youtube_url: null },
      { title: "Mule", track_number: 5, youtube_url: null },
      { title: "Passi", track_number: 6, youtube_url: null },
      { title: "Fely", track_number: 7, youtube_url: null },
      { title: "Muetse", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=9HbJTSrgIfI' },
      { title: "Muendu", track_number: 9, youtube_url: null },
      { title: "Lina", track_number: 10, youtube_url: null },
      { title: "Sela", track_number: 11, youtube_url: null },
    ],
  },
  {
    title: "Seva",
    year: 2001,
    slug: 'seva',
    format: "CD",
    label: "Lusafrica (56725 362462)",
    genre: "Pop / Folk, World, & Country",
    description: "℗ & © 2001 Noli Productions / Lusafrica",
    credits: 'Arranged By : Ballou Canta · Backing Vocals : Ballou Canta · Backing Vocals [Onomatopées] : Sandy Keale · Bass Guitar : Fernando Soria (3) · Drums : Djudjuchet Luvengoka · Engineer : Chris Chavenon · Lead Guitar : Caien Madoka · Lead Vocals : Akila',
    tracks: [
      { title: "Sal'", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=Sq6G_ih9KoA' },
      { title: "Seva", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=IMuF4lO2r84' },
      { title: "Secret d'Amour", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=yphDUKEb1kI' },
      { title: "Bijou", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=_dAKOmyNreM' },
      { title: "Shado", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=aiMdro4Agu4' },
      { title: "Elie", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=WmhRkB3eJVM' },
      { title: "Mayes", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=wvBORqQLZgQ' },
      { title: "Sandzy", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=Lr8Z4n6T6Tw' },
      { title: "Melia", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=AMKbyj13qxw' },
      { title: "Witse", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=1UJ2XyN5zqA' },
      { title: "Ultime Appel", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=GL4ObR4L5NE' },
      { title: "Barry", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=0uRDurWivfQ' },
    ],
  },
  {
    title: "Best Of",
    year: 2004,
    slug: 'best-of',
    format: "CD",
    label: "Lusafrica (36297-2)",
    genre: "Afro-Zouk / Compilation",
    description: "",
    credits: null,
    tracks: [
      { title: "Bane", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=J8UdLgTinM8' },
      { title: "Adia", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=h_HYQZq9ZEY' },
      { title: "Alphonsine", track_number: 3, youtube_url: null },
      { title: "Icole", track_number: 4, youtube_url: null },
      { title: "Mayumba", track_number: 5, youtube_url: null },
      { title: "Muetse", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=9HbJTSrgIfI' },
    ],
  },
  {
    title: "Saga",
    year: 2006,
    slug: 'saga',
    format: "CD",
    label: "Lusafrica (56725 462612)",
    genre: "Funk / Soul / Folk, World, & Country",
    description: "",
    credits: 'Artwork : Jean-Louis Chabry · Lyrics By, Music By : Kevin Sauron',
    tracks: [
      { title: "Saga", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=Prckn4YNbT8' },
      { title: "Ngèbe", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=gFDlZ76XwA0' },
      { title: "Muaye", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=_xIVJzo7BLw' },
      { title: "Nelly", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=rQKwpaAlfhE' },
      { title: "Mukuili", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=7aZH8Z0sKdA' },
      { title: "Betty", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=9RwdMCiPqMU' },
      { title: "Elodie", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=-lE98A5YRrk' },
      { title: "L.E.O.", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=PgWAADmZbvU' },
      { title: "Tate", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=cNZLYZORA34' },
      { title: "Noli", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=81B4I_-1hjk' },
      { title: "Kussu", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=6OaZ5dLk_Cc' },
      { title: "Lubuge", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=N8fjpsIqzcU' },
    ],
  },
  {
    title: "Best Of Clips",
    year: 2009,
    slug: 'best-of-clips',
    format: "DVD",
    label: "Lusafrica (56725)",
    genre: "Pop / Folk, World, & Country",
    description: "℗ & © 2008 Noli Productions / Lusafrica",
    credits: 'Authoring, Artwork : Fred Lima · Editor : Africa Nostra · Lyrics By, Music By : Oliver N\'Goma',
    tracks: [
      { title: "Saga", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=Prckn4YNbT8' },
      { title: "Betty", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=9RwdMCiPqMU' },
      { title: "Muaye", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=_xIVJzo7BLw' },
      { title: "Nge Spirit", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=KYMOXt6nO_E' },
      { title: "Adia", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=h_HYQZq9ZEY' },
      { title: "Mukuili", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=7aZH8Z0sKdA' },
      { title: "Sal", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=Sq6G_ih9KoA' },
      { title: "Lusa", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=JHs-8u-3ai8' },
      { title: "Shado", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=aiMdro4Agu4' },
      { title: "Ngebe", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=gFDlZ76XwA0' },
      { title: "Muetse", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=9HbJTSrgIfI' },
    ],
  },
];

export async function seed() {
  console.log("🌱 Démarrage du seed Oliver N'Goma...\n");

  const [artist] = await db
    .insert(artists)
    .values({
      name: "Oliver N'Goma",
      slug: 'oliver-ngoma',
      bio: OLIVER_N_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1959,
      death_year: 2010,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: OLIVER_N_BIO, name: "Oliver N'Goma" } })
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

  for (const disc of OLIVER_N_DISCOGRAPHY) {
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
