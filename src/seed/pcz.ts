import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const PCZ_BIO = `Pierre-Claver Zeng Ebome, né à Ntoum (Gabon) et disparu à Libreville en 2019, est l'une des figures les plus emblématiques du patrimoine musical gabonais. Chantre de la culture Fang, surnommé le "Dernier Poète Fang", il a consacré sa vie à adapter la structure narrative du Mvet — l'épopée traditionnelle Ekang — à la musique moderne. Ses textes, denses en proverbes et métaphores sur l'identité Ekang, traversent les décennies pour devenir un trésor culturel vivant. Entre 1970 et 2005, il enregistre huit albums aux croisements du continent : Libreville, Paris, Dakar. Sa mémoire est aujourd'hui portée par "Dzam Ene Va — Hommage à Zeng", un collectif d'artistes gabonais réuni pour perpétuer son œuvre et transmettre l'héritage du Mvet aux nouvelles générations.`;

const PCZ_DISCOGRAPHY = [
  {
    title: 'Zok / Mayi',
    year: 1970,
    slug: 'zok-mayi',
    format: '45T',
    label: 'Dragon Phénix (DPLS 123)',
    genre: 'Musique traditionnelle Fang',
    description: 'Premier disque de PCZ. "Zok" — L\'éléphant — est une métaphore politique puissante sur la force tranquille et la mémoire du peuple.',
    credits: null,
    tracks: [
      { title: 'Zok', track_number: 1, youtube_url: null },
      { title: 'Mayi', track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=ijNMyekb17g' },
    ],
  },
  {
    title: 'Matep Nté / Reste dans mes bras',
    year: 1975,
    slug: 'matep-nte',
    format: '45T',
    label: 'Sonafric (SAF 1755)',
    genre: 'Afro-pop / Slow',
    description: 'Premier grand virage stylistique. PCZ quitte temporairement la tradition pure pour explorer l\'Afro-pop et le slow. Un 45T qui surprend autant qu\'il séduit.',
    credits: null,
    tracks: [
      { title: 'Matep Nté', track_number: 1, youtube_url: null },
      { title: 'Reste dans mes bras', track_number: 2, youtube_url: null },
    ],
  },
  {
    title: 'Aba',
    year: 1977,
    slug: 'aba',
    format: '33T',
    label: 'Safari Sound (SA 103)',
    genre: 'Mvet / Musique traditionnelle Fang',
    description: 'L\'album pilier. Enraciné dans la tradition narrative du Mvet, il incarne pleinement le concept du "Dernier Poète Fang". "Bulu Abâ" évoque l\'Abâ — le corps de garde, lieu de la transmission, de la justice et de la palabre dans la tradition Fang. La chanson célèbre le rôle du patriarche et le maintien de la flamme culturelle dans la nuit (Bulu).',
    credits: null,
    tracks: [
      { title: 'Opwa', track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=yTii7lz4KyM', context: "« Opwa » désigne le léopard dans la tradition Fang — symbole de pouvoir, de ruse et de noblesse. Ce titre d'ouverture pose l'identité de l'album : une musique forte et silencieuse, qui avance dans l'ombre avant de frapper." },
      { title: 'Aba', track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=wsBXPrB_5t4', context: "L'Abâ est le corps de garde traditionnel Fang : lieu de parole, de justice et de transmission entre générations d'hommes. PCZ en fait un hymne à la mémoire collective — tenir l'Abâ debout, c'est tenir la culture debout." },
      { title: 'Afrika', track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=KeaF135B1jU', context: null },
      { title: 'Moan Essoga', track_number: 4, youtube_url: null, context: null },
      { title: 'Nguié', track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=k19S8VUhE0c', context: null },
      { title: 'Megnu', track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=RuYw28MDpao', context: null },
      { title: 'Bulu Abâ', track_number: 7, youtube_url: null, context: null },
    ],
  },
  {
    title: 'Essap',
    year: 1978,
    slug: 'essap',
    format: '33T',
    label: 'Dragon Phénix (DPX 816)',
    genre: 'Musique traditionnelle Fang',
    description: 'Un album sombre et dense, marqué par des textes chargés de proverbes Ekang. "Elisa", l\'une de ses rares chansons d\'amour pur, parle de la résistance d\'un couple face aux commérages du village — les ont-dit.',
    credits: null,
    tracks: [
      { title: "Messo'o", track_number: 1, youtube_url: null },
      { title: "Emoan'nane", track_number: 2, youtube_url: null },
      { title: 'Otiti wam', track_number: 3, youtube_url: null },
      { title: 'Assoum', track_number: 4, youtube_url: null },
      { title: 'Le Damné', track_number: 5, youtube_url: null },
      { title: 'Elisa', track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=f5MVYDN109Q' },
    ],
  },
  {
    title: 'Eya Moan',
    year: 1980,
    slug: 'eya-moan',
    format: '33T',
    label: 'Dragon Phénix (DPX 825)',
    genre: 'Musique traditionnelle Fang',
    description: 'Thème central : l\'épopée du Nord. Un voyage à travers les grandes mythologies du peuple Fang, porté par l\'écriture narrative propre au Mvet.',
    credits: null,
    tracks: [
      { title: 'Eya Moan', track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=lpY3uA-ShKc' },
      { title: 'Moan', track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=9kAIjgKonyk' },
    ],
  },
  {
    title: 'Mekang',
    year: 1983,
    slug: 'mekang',
    format: '33T',
    label: 'Safari Sound / Bia-Bia',
    genre: 'Musique traditionnelle Fang',
    description: 'Le casting All-Star. Une rencontre entre la profondeur poétique Fang et l\'excellence musicale panafricaine — un album de référence dans sa discographie.',
    credits: 'Aladji Touré (basse) · Jojo Kuo (batterie) · Jean-Claude Naimro (claviers)',
    tracks: [],
  },
  {
    title: 'Ekang Ye Ngom',
    year: 1987,
    slug: 'ekang-ye-ngom',
    format: '33T',
    label: 'Hamedi Records / Sonodisc',
    genre: 'Musique traditionnelle Fang',
    description: '"Le peuple Ekang et la forêt." Production franco-gabonaise d\'exception, enregistrée entre le Studio N\'Koussu à Libreville et le Studio Village Music à Paris. Arrangements signés Georges Seba, l\'homme derrière les chœurs de tant de stars africaines.',
    credits: 'Arrangements & Direction : Georges Seba · Philippe Guez (claviers) · Sam Ateba (percussions) · Alain Hatot (cuivres) · Studio N\'Koussu (Libreville) & Studio Village Music (Paris)',
    tracks: [
      { title: 'Bibulu', track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=BzzZNVgpo1s' },
      { title: "Mon Angoan'", track_number: 2, youtube_url: null },
      { title: 'Désolé', track_number: 3, youtube_url: null },
      { title: 'Mvere', track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=y8iHq92VLUE' },
      { title: 'Edzima', track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=jnjQYMALu4M' },
    ],
  },
  {
    title: 'Ntoum',
    year: 2005,
    slug: 'ntoum',
    format: 'CD',
    label: 'Auto-production',
    genre: 'Musique traditionnelle Fang',
    description: 'Son grand retour après 18 ans de silence discographique. Un album intime, auto-produit, qui boucle un cycle et confirme son statut de gardien du patrimoine Fang.',
    credits: null,
    tracks: [
      { title: 'Mibang mi si', track_number: 1, youtube_url: null, context: "Titre d'ouverture de l'album, « Mibang mi si » (les nouvelles du bas-pays) évoque le retour de l'exil intérieur — l'attente silencieuse de ceux restés au village pendant que le monde changeait autour d'eux." },
      { title: 'Ma dzing ve wa', track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=kApLS961wB0', context: "« Ma dzing ve wa » — littéralement « Je ne suis pas parti pour toi ». Une méditation sur la loyauté et la trahison au sein du clan. PCZ y règle des comptes à demi-mots, dans la tradition des chansons-procès du Mvet où les griefs collectifs sont portés à voix haute pour guérir la communauté." },
      { title: "N'toum", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Ukxi74rSMfM', context: "Ntoum est la ville natale de Pierre-Claver Zeng. Ce titre-éponyme clôt l'album comme un retour aux sources — une déclaration d'appartenance à la fois géographique et spirituelle. Après 18 ans de silence discographique, l'artiste revient là où tout a commencé : le village, la forêt, le nom de sa terre." },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed PCZ...\n');

  // Upsert artiste
  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Pierre-Claver Zeng Ebome',
      slug: 'pierre-claver-zeng',
      bio: PCZ_BIO,
      photo_url: null,
      death_year: 2019,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: PCZ_BIO, name: 'Pierre-Claver Zeng Ebome', death_year: 2019 } })
    .returning();

  console.log(`✅ Artiste : ${artist.name} (${artist.id})\n`);

  // Sauvegarder les image_url uploadées avant de purger
  const existingAlbums = await db
    .select({ slug: albums.slug, image_url: albums.image_url })
    .from(albums)
    .where(eq(albums.artist_id, artist.id));
  const savedImageUrls: Record<string, string | null> = Object.fromEntries(
    existingAlbums.map((a) => [a.slug, a.image_url])
  );

  // Purger les albums existants (cascade → tracks + contributions)
  await db.delete(albums).where(eq(albums.artist_id, artist.id));

  for (const disc of PCZ_DISCOGRAPHY) {
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
          context: ('context' in t ? t.context : null) ?? null,
        }))
      );
      console.log(`     └ ${trackCount} titre(s) : ${disc.tracks.map((t) => t.title).join(', ')}`);
    }
  }

  console.log('\n🌳 Seed terminé. La forêt est vivante.');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch((err) => {
    console.error('Erreur seed :', err);
    process.exit(1);
  });
}
