import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const ANG_LE_BIO = `Angèle Assélé est une artiste musicienne gabonaise née le 23 décembre 1967 à Libreville.`;

const ANG_LE_DISCOGRAPHY = [
  {
    title: "Esperancia",
    year: 1984,
    slug: 'esperancia',
    format: "Vinyl",
    label: "Editions Mademba (MD 1767)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: 'Bass Guitar : Pablo Madouma · Drums [Percussion] : Jean-Pierre Kohn · Keyboards [Synthesizer] : Alain Yomba · Lead Guitar : Mariano Mboumi · Lead Vocals : Angèle Assélé · Percussion [Toumba] : Deba Sungu · Rhythm Guitar : Manitou Mavoungou · Saxophone : Akouda Asso',
    tracks: [
      { title: "Esperancia", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=DPlruG0aWx0' },
      { title: "Assissiele", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Mademba", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Toi Et Moi", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=ikHcXEWJ7zA' },
      { title: "U.S.M.", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
    ],
  },
  {
    title: "Angèle Assele & Les Diablotins",
    year: 1985,
    slug: 'angele-assele-les-diablotins',
    format: "Vinyl",
    label: "Editions Mademba (MD 1768)",
    genre: "Folk, World, & Country / Soukous",
    description: "",
    credits: null,
    tracks: [
      { title: "Joie De Vivre", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=SMrEgfZ3G30' },
      { title: "We Mamiobi", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Adjouani A Mbongo", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=aJ93oyngkKI' },
      { title: "Après Toi", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=SWAyMgpHaR4' },
    ],
  },
  {
    title: "Amour Sans Frontières",
    year: 1985,
    slug: 'amour-sans-frontieres',
    format: "CDr",
    label: "Loaded Records",
    genre: "Electronic / Electro House",
    description: "For Promotional Use Only",
    credits: 'Featuring, Vocals : Ollie James · Producer, Written-By : Miriam Nervo · Promotion [Contact] : Tony Byrne',
    tracks: [
      { title: "This Kind Of Love (Radio Edit)", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=338tXXD8F0o' },
      { title: "This Kind Of Love (Pitron & Sanna Radio Edit)", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=EABkXtdATJ0' },
      { title: "This Kind Of Love (Extended Mix)", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=ELovaZPLJ9w' },
      { title: "This Kind Of Love (Club Mix)", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=-NpSZnOVxhk' },
      { title: "This Kind Of Love (Pitron & Sanna Remix)", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=tnNiswQ1XMw' },
      { title: "This Kind Of Love (Lazy Rich Remix)", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=dwkvlFpLAsM' },
      { title: "This Kind Of Love (Instrumental Radio Mix)", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=DDXLmYyFu4I' },
    ],
  },
  {
    title: "Au Nom De La Vie",
    year: 1998,
    slug: 'au-nom-de-la-vie',
    format: "CD",
    label: "Epssy Records (3044075)",
    genre: "Folk, World, & Country / Soukous",
    description: "",
    credits: null,
    tracks: [
      { title: "Au Nom De La Vie", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=EABkXtdATJ0' },
      { title: "Désespoir", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=uOTu7tH2x-Y' },
    ],
  },
  {
    title: "Feeling Love",
    year: 1998,
    slug: 'feeling-love',
    format: "CD",
    label: "Jimmy Jay Productions (662857 2)",
    genre: "Hip Hop / Jazz",
    description: "",
    credits: 'Producer : Jimmy Jay',
    tracks: [
      { title: "Tranquille (Radio Mix)", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Trankill (Paul Central Mix)", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Représente (Free Style)", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Tranquille (Album Version)", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=qt7NKvTs0b4' },
      { title: "Trankill (Instrumental Du Paul Central Mix)", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=U3kJvnSbZwU' },
      { title: "Représente (Instrumental Du Free Style)", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=VHTbzuuwv6w' },
      { title: "Trankill (Accapella Du Paul Central Mix)", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=SMrEgfZ3G30' },
    ],
  },
  {
    title: "Essentiel",
    year: 2020,
    slug: 'essentiel',
    format: "File",
    label: "Kage Pro",
    genre: "Folk, World, & Country / African",
    description: "2013 Kage Pro 2013 Georges Kamgoua",
    credits: null,
    tracks: [
      { title: "Mi Tonda Wè", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=O4MCvyjuhyY' },
      { title: "Feux de la Passion", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=w7HqefYV67w' },
      { title: "Innocence", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=EaaNaQSuBgo' },
      { title: "Les Parasites", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=7CeSX6P7I-M' },
      { title: "Bough'é Dia", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=noAJ1ruIIv8' },
      { title: "Azéva Mi Ntché", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=2WXYGzY9VoE' },
      { title: "C'est Fini", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=J0NiBJn_aiU' },
      { title: "Le Droit D'aimer", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=V8I7mLPF7c8' },
      { title: "Andigui", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=1_C1wUdulyc' },
      { title: "Espoir", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=3jNjnn4Ya28' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Angèle Assélé...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Angèle Assélé',
      slug: 'angele-assele',
      bio: ANG_LE_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1967,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: ANG_LE_BIO, name: 'Angèle Assélé' } })
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

  for (const disc of ANG_LE_DISCOGRAPHY) {
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
