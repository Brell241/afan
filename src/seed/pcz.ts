import 'dotenv/config';
import { db } from '../db';
import { artists, albums } from '../db/schema';

const PCZ_DISCOGRAPHY = [
  { title: 'Zok / Mayi', year: 1970, slug: 'zok-mayi', genre: 'Musique traditionnelle Fang', description: 'Premier enregistrement de Pierre-Claver Zeng, marquant ses débuts sur la scène musicale gabonaise.' },
  { title: 'Ma mién', year: 1975, slug: 'ma-mien', genre: 'Musique traditionnelle Fang', description: 'Album ancré dans la tradition orale Fang, mêlant chants rituels et mélodies acoustiques.' },
  { title: 'Aba', year: 1977, slug: 'aba', genre: 'Musique traditionnelle Fang', description: 'Cet album inclut le titre emblématique "Bulu Abâ", une œuvre phare du répertoire de PCZ.' },
  { title: 'Essap', year: 1978, slug: 'essap', genre: 'Musique traditionnelle Fang', description: 'Une exploration sonore des paysages culturels Fang du Gabon.' },
  { title: 'Eya Moan', year: 1980, slug: 'eya-moan', genre: 'Musique traditionnelle Fang', description: 'Album de maturité, témoignant de la profondeur poétique de Pierre-Claver Zeng.' },
  { title: 'Mekang', year: 1983, slug: 'mekang', genre: 'Musique traditionnelle Fang', description: 'Un voyage musical dans la spiritualité et la cosmogonie Fang.' },
  { title: 'Ekang ye Ngom', year: 1987, slug: 'ekang-ye-ngom', genre: 'Musique traditionnelle Fang', description: 'Ekang ye Ngom — "Le peuple Ekang et la forêt" — célèbre le lien indéfectible entre l\'homme et la nature.' },
  { title: 'Ntoum', year: 2005, slug: 'ntoum', genre: 'Musique traditionnelle Fang', description: 'Dernier album connu de PCZ, hommage à la ville de Ntoum et à ses racines.' },
];

const PCZ_BIO = `Pierre-Claver Zeng Ebome, né à Ntoum (Gabon), est l'une des figures les plus emblématiques du patrimoine musical gabonais. Chantre de la culture Fang, il a consacré sa vie à la préservation et à la transmission des chants traditionnels de son peuple. Sa voix, profonde et envoûtante, et ses textes en langue Fang ont traversé les décennies pour devenir un trésor culturel vivant. Entre 1970 et 2005, il a enregistré huit albums qui constituent aujourd'hui un témoignage précieux de la musique orale d'Afrique centrale.`;

async function seed() {
  console.log('🌱 Démarrage du seed...');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Pierre-Claver Zeng Ebome',
      slug: 'pierre-claver-zeng',
      bio: PCZ_BIO,
      photo_url: null,
    })
    .onConflictDoUpdate({
      target: artists.slug,
      set: { bio: PCZ_BIO },
    })
    .returning();

  console.log(`✅ Artiste créé : ${artist.name} (${artist.id})`);

  for (const album of PCZ_DISCOGRAPHY) {
    await db
      .insert(albums)
      .values({
        artist_id: artist.id,
        title: album.title,
        slug: album.slug,
        year: album.year,
        genre: album.genre,
        description: album.description,
        image_url: null,
        label: null,
      })
      .onConflictDoNothing();
    console.log(`  📀 ${album.year} — ${album.title}`);
  }

  console.log('🌳 Seed terminé.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Erreur seed :', err);
  process.exit(1);
});
