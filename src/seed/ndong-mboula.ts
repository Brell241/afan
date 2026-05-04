import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const NDONG_MBOULA_BIO = `Né le 1er janvier 1955 dans la province du Woleu-Ntem, Ndong Mboula est bien plus qu'un simple musicien gabonais : c'est une mémoire vivante de la musique du pays. Sa voix, imprégnée des rythmes traditionnels du nord du Gabon, a traversé les décennies pour devenir un pilier de l'identité culturelle locale. Considéré comme l'un des doyens de la scène musicale gabonaise, il a su marier les sonorités ancestrales avec une modernité discrète mais efficace.

Son titre emblématique *Etouk Nzom*, sorti en 2006, a marqué un tournant en popularisant un style à la fois enraciné et universel. Puis, en 2020, il a surpris son public avec *Elone 2.0*, une version revisitée qui prouve que sa créativité reste intacte. À travers ces œuvres, Ndong Mboula ne se contente pas de chanter : il raconte les histoires de son peuple, transmet des émotions et tisse un lien entre les générations.

Aujourd'hui, son héritage dépasse les frontières du Gabon. En véritable gardien du patrimoine musical, il incarne la résilience d'une culture qui refuse de s'éteindre. Ndong Mboula n'est pas seulement un artiste : c'est un pont entre le passé et l'avenir, un témoin vibrant de la richesse sonore de l'Afrique centrale.`;

const NDONG_MBOULA_DISCOGRAPHY = [
  {
    title: "Etouk Nzom",
    year: 2007,
    slug: 'etouk-nzom',
    format: "Compilation YouTube",
    label: "",
    genre: "Folk-Pop Fang / Musique traditionnelle",
    description: "",
    credits: null,
    image_url: 'https://i.ytimg.com/vi/OT8KtLJNGsE/hqdefault.jpg',
    tracks: [
      { title: "Gabon Etouk Dzom", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=OT8KtLJNGsE' },
      { title: "Etouk Ndzome", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=nBRvwGUCaEc' },
      { title: "Dementos", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=cmxe-a078GU' },
      { title: "Olik Ma Wou", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=6wQ4BYrnJYA' },
      { title: "_Tah Mekouba", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=Qyzu2ZJJ05Q' },
      { title: "Sida maladie inguérissable", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=MnFBc8WHNdw' },
      { title: "Lorysse", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=oCINVCr7GUs' },
      { title: "Moise Demoz", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=pdw-KwJwT3w' },
      { title: "Culture fang beti Olik m'awu", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=V1Y7M5KFMjU' },
    ],
  },
  {
    title: "Monsieur le Roi",
    year: 2020,
    slug: 'monsieur-le-roi',
    format: "Album",
    label: "",
    genre: "Folk-Pop Fang / Musique traditionnelle",
    description: "",
    credits: null,
    image_url: 'https://i.ytimg.com/vi/QIQhaT75MLg/hqdefault.jpg',
    tracks: [
      { title: "Edzing", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=QIQhaT75MLg' },
      { title: "Jusqu'au petit matin", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=RUKmHM9Cmss' },
      { title: "Mong ye Oyem", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=ozI4PuVTuIc' },
      { title: "Piment", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=cmxe-a078GU' },
      { title: "Etam", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=cmxe-a078GU' },
      { title: "Essong", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=rr-SxD_IHKI' },
      { title: "Allez les panthères", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=IwdJFl81woI' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Ndong Mboula...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Ndong Mboula',
      slug: 'ndong-mboula',
      bio: NDONG_MBOULA_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1955,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: NDONG_MBOULA_BIO, name: 'Ndong Mboula' } })
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

  for (const disc of NDONG_MBOULA_DISCOGRAPHY) {
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
