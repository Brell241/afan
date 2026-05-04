import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const CHRIS_AYOUME_BIO = `Christian Ayume, connu sous le nom de Chriss Ayoumé, est né à Port-Gentil, capitale économique du Gabon. Après avoir fréquenté le lycée technique Omar Bongo à Libreville, il rejoint un groupe d'amis avec qui il perpétue la tradition du son « capo », avant de devenir l'un des plus jeunes chanteurs principaux de sa génération.

En 1990, l'orchestre Evizo Stars est fondé sous la direction d'Ossavou Louis, et Chriss en devient la voix emblématique. Le groupe connaît un franc succès avec deux albums : Jazz à la Plantation puis V.I.P. (1996, Blue Silver Distribution). Chris Ayoumé signe ensuite un premier album solo, Couche d'Ozone, sous le label JPS en France, puis forme un duo avec Krate Mounéké pour l'album Excès de Zèle (Chriss Production, 1998).

Auteur-compositeur confirmé et figure de proue de la nouvelle génération de chanteurs gabonais, Chris Ayoumé s'éteint le 5 janvier 2004 à Paris, à l'âge de 33 ans.`;

const CHRIS_AYOUME_DISCOGRAPHY = [
  {
    title: "Jazz à la Plantation",
    year: 1993,
    slug: 'jazz-a-la-plantation',
    format: "Album",
    label: "Evizo Stars",
    genre: "Afro-zouk / Folk africain",
    description: "Premier album d'Evizo Stars, chanté par Chris Ayoumé.",
    credits: null,
    image_url: null,
    tracks: [
      { title: "Jazz à la plantation", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=zRYfSknFEIk' },
    ],
  },
  {
    title: "V.I.P.",
    year: 1996,
    slug: 'v-i-p',
    format: "CD",
    label: "Blue Silver Distribution",
    genre: "Afro-zouk / Folk africain",
    description: "Deuxième album d'Evizo Stars, distribué sur Blue Silver Distribution.",
    credits: null,
    image_url: 'https://i.discogs.com/bARBfCVFc-Y6mYDNQBRs-C8TPqQEWNtKvJQZX-n2iNA/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE1ODIw/MDI0LTE1OTgzOTA3/OTUtNTk4NC5qcGVn.jpeg',
    tracks: [
      { title: "Fusion", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=5t29rYFJ81k' },
      { title: "Soleil De Minuit", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=gFsRCAtasyw' },
      { title: "Mone Fam", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=CzS1GbiM2j8' },
      { title: "Séparé", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=PMtW1FUQiq4' },
      { title: "O'Mwana", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=CrQ5jwFVhTE' },
      { title: "Zika Mi Ndélé", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=LKxbQ4DyTAY' },
      { title: "Matasse", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=T_1rAF8x1a0' },
      { title: "Allô !", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=okJKLmwzvD8' },
      { title: "Niulilu (Ecoute Moi)", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=SAu0rOObLPs' },
      { title: "Nkombe", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=T_1rAF8x1a0' },
    ],
  },
  {
    title: "Couche d'Ozone",
    year: 1997,
    slug: 'couche-d-ozone',
    format: "Album",
    label: "JPS",
    genre: "Afro-zouk",
    description: "Premier album solo de Chris Ayoumé, enregistré en France sous le label JPS.",
    credits: null,
    image_url: null,
    tracks: [
      { title: "Coco", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=SYpnThcjzD0' },
      { title: "Mandji bo", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=Cy5KaMr2J1M' },
    ],
  },
  {
    title: "Excès de Zèle",
    year: 1998,
    slug: 'exces-de-zele',
    format: "Album",
    label: "Chriss Production",
    genre: "Afro-zouk",
    description: "Album en duo avec Krate Mounéké, sous le label Chriss Production.",
    credits: "Chriss Ayoumé & Krate Mounéké",
    image_url: null,
    tracks: [],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Chris Ayoumé...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Chris Ayoumé',
      slug: 'chris-ayoume',
      bio: CHRIS_AYOUME_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: CHRIS_AYOUME_BIO, name: 'Chris Ayoumé' } })
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

  for (const disc of CHRIS_AYOUME_DISCOGRAPHY) {
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
