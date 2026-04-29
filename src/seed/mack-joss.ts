import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const MACK_JOSS_BIO = `Artist, producer, percussionist, vocalist, drum programmer, writer, composer, cover designer and engineer from Gabon.
(b. 1946 - d. 2018)`;

const MACK_JOSS_DISCOGRAPHY = [
  {
    title: "Mourou Tabe",
    year: 1973,
    slug: 'mourou-tabe',
    format: "Vinyl",
    label: "Sonafric (SAF 1590)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Mourou Tabe", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=acOMs-RHgD4' },
      { title: "Vi Vie", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=jchNtHmy0cg' },
    ],
  },
  {
    title: "Mack Joss Et Le Negro-Tropical - Vol. 1",
    year: 1978,
    slug: 'mack-joss-et-le-negro-tropical-vol-1',
    format: "Vinyl",
    label: "Sonafric (SAF 50078)",
    genre: "Latin / Funk / Soul",
    description: "",
    credits: null,
    tracks: [
      { title: "Ndodzi Essali Nessogni", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=3TKHSqM5lVY' },
      { title: "Peuple", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=OtkuGuXgdCw' },
      { title: "Josephine", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=nXVxdgrcgB8' },
      { title: "Veve", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=O16Xmap_bmw' },
      { title: "Alphonsine", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=i_kJGkY_SNc' },
      { title: "Les Criminelles", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=gA0Oj9Q_HWs' },
      { title: "Tsiyandza Kani", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=j4sDaqOwq7E' },
      { title: "Mipenguino Marie-Jeanne", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=Jxht23kZPhc' },
    ],
  },
  {
    title: "Mack Joss Et Le Negro-Tropical",
    year: 1978,
    slug: 'mack-joss-et-le-negro-tropical',
    format: "Vinyl",
    label: "Sonafric (SAF 50079)",
    genre: "Latin / Funk / Soul",
    description: "Similar cover artwork as the earlier , with cat.# suggesting this would be 'Vol. 2', but there is no mention to this anywhere on the record.",
    credits: null,
    tracks: [
      { title: "Voyage", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=ZEkAJujcjCc' },
      { title: "Bati Mboka", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=TFRGKDO9EDM' },
      { title: "Colette Okei Elaka Te", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=tyOKE67sCgc' },
      { title: "Tribalisme", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=czxShxwkZbw' },
      { title: "Bassa Mulongue", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=7-ATrhOJcUA' },
      { title: "Jolie Cahier", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=OiGGl-VMkO8' },
      { title: "Nzaou", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=2_ZA_IxHFKc' },
      { title: "Ta Te Diangue", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=PaSaEK67D2A' },
    ],
  },
  {
    title: "Ami",
    year: 1980,
    slug: 'ami',
    format: "Vinyl",
    label: "Mwane Mboumbe (DD-5)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: 'Orchestra : L\'Orchestre Negro-Tropical',
    tracks: [
      { title: "Ami (1)", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=PfHHgRxe-vQ' },
      { title: "Ammi (2)", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=pbBLesYWwDc' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Mack Joss...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Mack Joss',
      slug: 'mack-joss',
      bio: MACK_JOSS_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: MACK_JOSS_BIO, name: 'Mack Joss' } })
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

  for (const disc of MACK_JOSS_DISCOGRAPHY) {
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
