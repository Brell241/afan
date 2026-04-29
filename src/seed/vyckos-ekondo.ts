import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const VYCKOS_EKONDO_BIO = `Vyckos Ekondo, né en 1951 et mort le 14 août 2023 à Casablanca, est un auteur-compositeur gabonais.`;

const VYCKOS_EKONDO_DISCOGRAPHY = [
  {
    title: "Mbea",
    year: 1977,
    slug: 'mbea',
    format: "Vinyl",
    label: "Pathé Marconi EMI (2C 006.15813)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Mbea", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=t6xo73uOWfQ' },
      { title: "Dibenga", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=7UAwC_CopQ0' },
    ],
  },
  {
    title: "Diwowo / A Gnambie",
    year: 1978,
    slug: 'diwowo-a-gnambie',
    format: "Vinyl",
    label: "Fiesta (7) (51.301)",
    genre: "Funk / Soul / Folk, World, & Country",
    description: "",
    credits: 'Arranged By, Directed By : Kemayo · Orchestra : K. System · Photography By : Pierre René-Worms · Recorded By, Mixed By : Henri Arcens',
    tracks: [
      { title: "Diwowo", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=vsjYMXy8Khw' },
      { title: "A Gnambie", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=7UAwC_CopQ0' },
    ],
  },
  {
    title: "Le Cable Du Tandima",
    year: 1985,
    slug: 'le-cable-du-tandima',
    format: "Vinyl",
    label: "Polinia Saint-Lazare (EV 1266)",
    genre: "Jazz / Folk, World, & Country",
    description: "",
    credits: 'Accompanied By : Les Vieux De La Vieille · Advisor : Polycarpe Allongo · Alto Saxophone : Jean-Marie Tang · Arranged By : Alain Yomba · Arranged By, Engineer : Ambroise Voundi · Bass Guitar : Ngoma Degomard · Choir : Eférol Eboa · Drums : Jean-Pierre Kohn',
    tracks: [
      { title: "Essova", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=Ad1oHZxwmJI' },
      { title: "Vyckos Revient", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=ZY9dUe_VqOw' },
      { title: "Azaminoko", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=F3_6QB1TqGk' },
      { title: "Mwana - Maninga", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=gHTjcXwP5MI' },
    ],
  },
  {
    title: "Vaccination Oh maman !",
    year: 1987,
    slug: 'vaccination-oh-maman',
    format: "Vinyl",
    label: "Not On Label",
    genre: "Funk / Soul / Afrobeat",
    description: "",
    credits: 'Arranged By : André Manga',
    tracks: [
      { title: "Vaccination Oh Maman ! (Chanté)", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=fCAaT7SOvH4' },
      { title: "Vaccination Oh maman ! (instrumental)", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=9yrHAuhQx4M' },
    ],
  },
  {
    title: "Iyakéta",
    year: 1990,
    slug: 'iyaketa',
    format: "Vinyl",
    label: "Not On Label (13785)",
    genre: "Funk / Soul / Afrobeat",
    description: "Produit par Le Ministere de la Sante et des Affaires Sociales du Gabon\nVyckos Ekondo Artiste Producteur BP. 13 785 Libreville - Gabon -",
    credits: 'Arranged By, Directed By, Composed By : Vyckos Ekondo · Chorus : Effereol Eboa · Engineer : Benjamin Opaga · Featuring : Alain Yomba · Percussion : Jean Marie Nzengui Moulengui',
    tracks: [
      { title: "Vandé-Ebégho", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=vn_f07b_Av0' },
      { title: "Iyakéta", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=C27wCG-utdg' },
      { title: "Tandima", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=7UAwC_CopQ0' },
      { title: "L'allaitement Maternel", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=EV2LK4ewm1k' },
      { title: "Vaccination, oh Maman", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=fCAaT7SOvH4' },
      { title: "Stop Sida", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=iPyUMfx6o94' },
      { title: "Bovenga Ngoyi", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=7UAwC_CopQ0' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Vyckos Ekondo...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Vyckos Ekondo',
      slug: 'vyckos-ekondo',
      bio: VYCKOS_EKONDO_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1951,
      death_year: 2023,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: VYCKOS_EKONDO_BIO, name: 'Vyckos Ekondo' } })
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

  for (const disc of VYCKOS_EKONDO_DISCOGRAPHY) {
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
