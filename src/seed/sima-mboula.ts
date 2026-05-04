import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const SIMA_MBOULA_BIO = `Niché au cœur des forêts verdoyantes du nord du Gabon, dans la ville d’Oyem, un enfant voit le jour en 1964. Ce garçon, prénommé Sima Mboula, grandit bercé par les rythmes ancestraux et les chants de sa terre natale. Très tôt, sa voix puissante et son amour pour les traditions orales le distinguent, faisant de lui un gardien naturel de la mémoire musicale de son peuple.

Adulte, Sima Mboula devient bien plus qu’un simple interprète : il est un passeur de cultures. Sa musique, enracinée dans les sonorités traditionnelles gabonaises, résonne comme un pont entre les générations. Chaque note qu’il chante est une invitation à redécouvrir les contes, les danses et les rituels qui ont façonné l’identité de sa région.

Aujourd’hui, ce chanteur emblématique est une figure respectée de la scène musicale gabonaise. Par son art, il continue de faire vivre l’héritage de ses ancêtres, prouvant que la tradition, loin de se figer, peut vibrer avec force dans le monde moderne. Sima Mboula reste ainsi un écho vivant des forêts d’Oyem, un souffle qui ne s’éteint pas.`;

const SIMA_MBOULA_DISCOGRAPHY = [
  {
    title: "Principales œuvres",
    year: 2000,
    slug: 'principales-oeuvres',
    format: "Compilation YouTube",
    label: "",
    genre: "Musique gabonaise / Traditionnel / Folk",
    description: "",
    credits: null,
    image_url: 'https://res.cloudinary.com/ddymfjzpi/image/upload/v1777583571/afan/albums/principales-oeuvres.jpg',
    tracks: [
      { title: "ELONE O ALIGHE NYE ETAM", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=_54oTCZM_Eg' },
      { title: "bal poussière", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=j4I7k7VP0aM' },
      { title: "Pelly N", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Qaq80LzzAP0' },
      { title: "Les Fangs du Gabon 9 a Nfoul", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=a8Jk15dLSi0' },
      { title: "Dementos", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=cmxe-a078GU' },
      { title: "Alene Essong", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=0B-m5g-BhZQ' },
      { title: "Alene Essong (feat. Sima Junior)", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=rr-SxD_IHKI' },
      { title: "élone alane", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=cSGfI_-NmfU' },
      { title: "Alane", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=DUNNPp3UqTg' },
      { title: "ovianga", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=PQ-x10fe7-E' },
      { title: "Mama pauline messie", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=0-2hd0XdBvU' },
      { title: "''Bébé''", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=B_ka7lLnlLE' },
      { title: "Lorysse", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=oCINVCr7GUs' },
      { title: "Elone", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=_pSm3sfXUiQ' },
      { title: "Don_zer", track_number: 15, youtube_url: 'https://www.youtube.com/watch?v=l_85DHE6fmQ' },
      { title: "Niveau A tobe Ya Bloque", track_number: 16, youtube_url: 'https://www.youtube.com/watch?v=Wt42PSo90hE' },
      { title: "Deux mille collé", track_number: 17, youtube_url: 'https://www.youtube.com/watch?v=lU8ktX8ZahM' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Sima Mboula...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Sima Mboula',
      slug: 'sima-mboula',
      bio: SIMA_MBOULA_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1964,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: SIMA_MBOULA_BIO, name: 'Sima Mboula' } })
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

  for (const disc of SIMA_MBOULA_DISCOGRAPHY) {
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
