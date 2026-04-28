import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const HILARION_BIO = `Nguema Etem Hilarion, dit "Mister Dynamite", né le 31 décembre 1943 à Nkoltang (province de l'Estuaire), est l'un des fondateurs de la musique gabonaise moderne. Emprisonné pendant ses années de gloire avec Afro Succès, il sort en 1967 et reprend sa plume. Sa vraie renaissance internationale survient en 1986 avec "Sida" — première chanson francophone sur le SIDA, passée en boucle dans les émissions de prévention à travers le monde. Ses textes sont des "petites scènes de théâtre" qui fusionnent makossa, soukous, rumba, afro-zouk et biguine pour dépeindre avec ironie la vie quotidienne du "petit peuple" : le couple, l'argent, la crise, la corruption. Chantant en français plutôt qu'en fang, il touche une audience panafricaine et devient un miroir social de son époque.`;

const HILARION_DISCOGRAPHY = [
  {
    title: 'Espoir / Libreville',
    year: 1968,
    slug: 'espoir-libreville-1968',
    format: '45T',
    label: 'Sonafric',
    genre: 'Afro-pop',
    description: "Premier 45T d'Hilarion Nguéma avec l'Orchestre Afro Succès, co-fondé avec Paul-Marie Mounanga. \"Espoir\" et \"Libreville\" deviennent deux hymnes populaires dans la Libreville des années 60. Ces chansons sont écrites après sa libération de prison en 1967.",
    credits: "Avec l'Orchestre Afro Succès",
    tracks: [
      { title: 'Espoir', track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=CGv9Bq7zR8s' },
      { title: 'Libreville', track_number: 2, youtube_url: null },
    ],
  },
  {
    title: 'Makokou / J\'ai dormi la porte ouverte',
    year: 1974,
    slug: 'makokou-1974',
    format: '45T',
    label: 'Sonafric',
    genre: 'Afro-pop',
    description: "45T de la période Afro Succès. \"Makokou\" célèbre la ville de l'Ogooué-Ivindo, carrefour du Gabon intérieur. Son texte mêle observation sociale et attachement au terroir.",
    credits: "Avec l'Orchestre Afro Succès",
    tracks: [
      { title: 'Makokou', track_number: 1, youtube_url: null },
      { title: "J'ai dormi la porte ouverte", track_number: 2, youtube_url: null },
    ],
  },
  {
    title: 'Quand la femme se fâche',
    year: 1976,
    slug: 'quand-la-femme-se-fache',
    format: '45T',
    label: 'Sonafric',
    genre: 'Afro-pop / Satire conjugale',
    description: "L'un de ses classiques absolus sur les tensions du couple. Hilarion y observe avec une ironie tendre et précise les dynamiques conjugales africaines — un sujet qu'il revisite tout au long de sa carrière.",
    credits: null,
    tracks: [
      { title: 'Quand la femme se fâche', track_number: 1, youtube_url: null },
      { title: "Quand l'homme est content", track_number: 2, youtube_url: null },
    ],
  },
  {
    title: 'Sida',
    year: 1986,
    slug: 'sida',
    format: '33T',
    label: 'Haissam Records (MH 0104)',
    genre: 'Sensibilisation / Rumba-Soukous',
    description: 'Premier grand album solo, produit avec le Camerounais Haissam Moussa. "Sida" est revendiquée comme la toute première chanson francophone sur le SIDA — diffusée dans les campagnes de prévention à travers le monde entier. L\'album marque son retour fracassant après des années de silence.',
    credits: 'Production : Haissam Moussa · Distribution : Safari Ambiance / Musidisc',
    tracks: [
      { title: 'Gabon Pays De Joie', track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=onTfvidnI5I' },
      { title: 'Okone Ya Nem', track_number: 2, youtube_url: null },
      { title: 'Sida', track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=RIXasUzUF6I' },
      { title: 'La Personne De Mes Rêves', track_number: 4, youtube_url: null },
    ],
  },
  {
    title: 'Crise Économique',
    year: 1988,
    slug: 'crise-economique',
    format: '33T',
    label: 'Haissam Records',
    genre: 'Satire sociale / Afro-pop',
    description: 'Suite logique du succès de "Sida". Hilarion peint avec un humour acerbe la vie chère à Libreville et les travers du couple. "L\'Amour est Aveugle" et "Espoir" sont deux réussites mélodiques qui prouvent l\'étendue de son registre. Avec Aladji Touré à la basse.',
    credits: 'Production : Haissam Moussa · Aladji Touré (basse)',
    tracks: [
      { title: "L'amour est aveugle", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=aQQxiCj2inM' },
      { title: 'Edzing ya nem', track_number: 2, youtube_url: null },
      { title: 'Bong-Be Yafrica', track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=d_E5spHcOd0' },
      { title: 'Crise économique', track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=sLMvMR8vz1s' },
      { title: 'Il faut connaître', track_number: 5, youtube_url: null },
      { title: 'Espoir', track_number: 6, youtube_url: null },
    ],
  },
  {
    title: 'Dévaluation',
    year: 1995,
    slug: 'devaluation',
    format: 'CD',
    label: 'Haissam Records',
    genre: 'Satire sociale / Afro-pop',
    description: "La dévaluation du franc CFA de 1994 comme toile de fond. Hilarion s'empare de la crise économique pour en faire une chronique sociale de premier ordre, avec son humour caractéristique face à l'adversité.",
    credits: 'Production : Haissam Moussa',
    tracks: [
      { title: 'Dévaluation', track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=CYVGtgCx2IA' },
    ],
  },
  {
    title: 'Trop Bon Trop Con',
    year: 1999,
    slug: 'trop-bon-trop-con',
    format: 'CD',
    label: 'Haissam Records',
    genre: 'Satire sociale / Afro-pop',
    description: 'Un titre-programme. L\'album explore le paradoxe de la bonté dans un monde de rapports de force, avec ce sens de la formule qui fait la marque Hilarion Nguéma.',
    credits: 'Production : Haissam Moussa',
    tracks: [],
  },
  {
    title: 'Faut Pas Toucher',
    year: 2002,
    slug: 'faut-pas-toucher',
    format: 'CD',
    label: 'Haissam Records',
    genre: 'Satire sociale / Afro-pop',
    description: 'Un retour aux fondamentaux satiriques. L\'album revisite les thèmes chers à Hilarion — les femmes, l\'argent, le pouvoir — avec une maturité d\'écriture renforcée. "Mama Yoka" est un coup de cœur.',
    credits: 'Production : Haissam Moussa',
    tracks: [
      { title: 'Faut pas toucher', track_number: 1, youtube_url: null },
      { title: 'Afro Succès', track_number: 2, youtube_url: null },
      { title: 'Le temps', track_number: 3, youtube_url: null },
      { title: 'Etam etam', track_number: 4, youtube_url: null },
      { title: 'La salsa', track_number: 5, youtube_url: null },
      { title: 'Mama Yoka', track_number: 6, youtube_url: null },
      { title: 'Ebol hilarion', track_number: 7, youtube_url: null },
      { title: 'Nkout wakou', track_number: 8, youtube_url: null },
      { title: 'Venzame', track_number: 9, youtube_url: null },
    ],
  },
  {
    title: 'La Gazelle et l\'Éléphant',
    year: 2008,
    slug: 'la-gazelle-et-lelephant',
    format: 'CD',
    label: 'Haissam Records',
    genre: 'Satire sociale / Afro-pop',
    description: "Son dernier album studio. La gazelle et l'éléphant — une métaphore animalière classique dans la tradition africaine pour parler des rapports entre faibles et puissants, entre le peuple et les gouvernants.",
    credits: 'Production : Haissam Moussa',
    tracks: [],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Hilarion Nguéma...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Hilarion Nguéma',
      slug: 'hilarion-nguema',
      bio: HILARION_BIO,
      photo_url: null,
      avatar_url: null,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: HILARION_BIO, name: 'Hilarion Nguéma' } })
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

  for (const disc of HILARION_DISCOGRAPHY) {
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
