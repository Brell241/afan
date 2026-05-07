import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const PAP_NZIENGUI_BIO = `Papé Nziengui est un joueur de ngombi (harpe sacrée à huit cordes) né vers 1958 à Mouila, dans le sud du Gabon, de parents Tsogho. Initié au Bwiti, il développe un style unique qui mêle la musique rituelle Tsogho à une production studio moderne, tissant ensemble hochets traditionnels, chœurs masculins en appel-réponse, rythmes féminins du culte et couches de synthétiseur. Voyageur infatigable, il a parcouru le monde lors de sessions et de concerts internationaux, accompagnant des stars du continent comme Papa Wemba, Manu Dibango et Kassav', avant de fonder son groupe Bovenga.`;

const PAP_NZIENGUI_DISCOGRAPHY = [
  {
    title: "Kadi Yombo",
    year: 1989,
    slug: 'kadi-yombo',
    format: "Album",
    label: "Awesome Tapes From Africa",
    genre: "Musique Tsogho / Bwiti",
    description: "Chef-d'œuvre du postmodernisme musical gabonais de la fin des années 80, cet album fusionne la musique rituelle Tsogho avec une production studio contemporaine, mêlant hochets et synthétiseurs.",
    credits: null,
    image_url: 'https://res.cloudinary.com/ddymfjzpi/image/upload/v1778133592/afan/albums/principales-oeuvres.jpg',
    tracks: [
      { title: "Kadi Yombo", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=2q8olU8Bqhs' },
      { title: "Gho Mitsaba Na Voko", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=3eLWGltfHL4' },
      { title: "Bossogho Akéti Na Missingui", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=oiJIKQpkLio' },
      { title: "Moghogho", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=PSiDQWcxT_A' },
      { title: "Gho Minongo", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=9y8V8v0Sslk' },
      { title: "Ngondé", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=060u983gxw8' },
      { title: "Popedaka", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=bAf79UWAOgs' },
      { title: "Niaghauliano Ghuni", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=QTeBRWSwP0w' },
      { title: "Kudu", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=UEVjuEuQcrM' },
      { title: "Gho Boka Nzambé", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=X_DyBPDjieI' },
    ],
  },
  {
    title: "Autres œuvres",
    year: 2000,
    slug: 'autres-oeuvres',
    format: "Singles & Featurings",
    label: "",
    genre: "Musique Tsogho / Bwiti",
    description: "",
    credits: null,
    image_url: null,
    tracks: [
      { title: "Maganga", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=oMK50YjfitQ' },
      { title: "Rite Bwiti", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=2pVHKv2PxQ8' },
      { title: "Ngondêa", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=H-rlsGxBXSA' },
      { title: "Ebando", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=TfhMILJP86k' },
      { title: "Mbadza", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=dRnaGq1zExE' },
      { title: "Blanche Ntembe", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=-Nqdsbn7TC8' },
      { title: "Bwiti Simba Nzambe Kana Gombi", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=ut3BA96QRTU' },
      { title: "Enfant du Village", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=FGg889dWN7U' },
      { title: "Ndongo Banza", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=BPSPzxX4xPA' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Papé Nziengui...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Papé Nziengui',
      slug: 'pape-nziengui',
      bio: PAP_NZIENGUI_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: PAP_NZIENGUI_BIO, name: 'Papé Nziengui' } })
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

  for (const disc of PAP_NZIENGUI_DISCOGRAPHY) {
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
