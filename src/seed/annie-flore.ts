import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const ANNIE_FLORE_BIO = `Annie-Flore Batchiellilys, née en 1967 à Tchibanga, est une chanteuse, musicienne, compositrice et sénatrice gabonaise, de langue maternelle punu, alliant les formes traditionnelles de chant au jazz et au blues.`;

const ANNIE_FLORE_DISCOGRAPHY = [
  {
    title: "Val / Tu Wuloinu Malongui / N'Dossi",
    year: 1995,
    slug: 'val-tu-wuloinu-malongui-n-dossi',
    format: "CD",
    label: "Centre Social Armand Lanoux (CAL002)",
    genre: "Folk, World, & Country / African",
    description: "\"Finale 8ème tremplin rock de Rives de Gier - 1er prix\"",
    credits: 'Arranged By : Musical Tribu · Bass : Olivier Gaudin · Drums : Régis Zuccarelli · Guitar : Denis Piejut · Percussion : Vincent Dill · Saxophone : Olivier Peilhon (2) · Trombone : Olivier Barge',
    tracks: [
      { title: "Val", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=sBSX_oSghnw' },
      { title: "Tu Wuloinu Malongui", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=5oV-ZhU-DrY' },
      { title: "N'Dossi", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=uOTu7tH2x-Y' },
    ],
  },
  {
    title: "Afrique Mon Toit",
    year: 1997,
    slug: 'afrique-mon-toit',
    format: "CD",
    label: "Not On Label (Annie-Flore Batchiellilys Self-released) (AFB003)",
    genre: "Folk, World, & Country",
    description: "Standard jewel case\nComes with a 4-page booklet\n\nMade in France",
    credits: 'Bass : Abdallah Bensach · Drums : Francis Koelsch · Guitar : Yvan Agbo · Guitar, Programmed By : Adolphe Tiki · Guitar, Programmed By, Arranged By : Josi Souc · Percussion, Tam-tam : Frangois-Mwuamba Sembani · Producer, Management, Realization, Arranged By, Layout : Didier Peilhon · Realization, Written-By, Arranged By, Lead Vocals, Chorus : Annie-Flore Batchiellilys',
    tracks: [
      { title: "Afrique Mon Toit", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=ifZt92CGzfg' },
      { title: "Ndossi", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=Hd02d482ZMg' },
      { title: "Mognu En Vérité", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=mUwy04hcQoA' },
      { title: "Point D'interrogation", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=u21ZiKiyNnc' },
      { title: "U Ya Ketsoïss", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=WbW0CdUMrlU' },
      { title: "Missoli", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=P_tBoJuLGk4' },
      { title: "Kokolu", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=BXtfjGMF0EY' },
      { title: "Issaghanu", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=i4c5sKPyI8Y' },
      { title: "Afrique Mon Toit (Instrumental)", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=oBlgN2F_i78' },
    ],
  },
  {
    title: "Diboty",
    year: 2002,
    slug: 'diboty',
    format: "CD",
    label: "AFB Music",
    genre: "Folk, World, & Country / African",
    description: "Recorded at Castel Records Lyon.\n\nMay 2002.",
    credits: 'Arranged By, Producer : Annie-Flore Batchiellilys · Graphics : Hervé Fayet · Mastered By : Lionnel Vasseur · Mixed By : Pascal Indelicato · Photography By : Didier Peilhon',
    tracks: [
      { title: "Le Reve Du Swing", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=sAFrjc8SCo4' },
      { title: "Warisse", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=O9u6hm12tuo' },
      { title: "Diboty", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=20JUbt0_oGg' },
      { title: "Le Chant C'Est Mon Champ", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=dkbmNjBWvQY' },
      { title: "Moine Vole (Sur Le Prélude De Bach)", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=ZmGRZ29gziY' },
      { title: "Ça Va Chauffer", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=uKykTXQzWPc' },
      { title: "Tsé Quand T'Es Pas La", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=BKTukNXE6r4' },
      { title: "Mulimbu", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=qT5pSnELqV4' },
      { title: "C'Est Ma Griffe N.W.R", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=5hWNP1ROETU' },
      { title: "Non A La Violence", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=p1T6VtXOGZ4' },
      { title: "Bisse Ngabu", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=e5BZZSzQiug' },
      { title: "Gitsimbu", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=OET0-wznqz8' },
      { title: "Veghe", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=-YPu_Rp_FWg' },
      { title: "Missamu", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=2jySaTtdndA' },
    ],
  },
  {
    title: "Je t'invite",
    year: 2004,
    slug: 'je-t-invite',
    format: "CD",
    label: "AFB Music",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Je T'invite", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=JIgJNCMom_E' },
      { title: "Ba Mossi", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=yxu-1ocC9Po' },
      { title: "Le Bien Est Dans Tes Mains", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=nqxIuVqw2PE' },
      { title: "Kodu Na Kodu", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=k7bUf1U2Ge0' },
      { title: "Ndeinguily", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=qMktFoMbnpk' },
      { title: "Glawdys", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=sBSX_oSghnw' },
      { title: "Yaya", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=HdlVn6U2_kQ' },
      { title: "Ni Wu Rondi", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=9awurec3smA' },
      { title: "Nougaro", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=EK3Y2qrgH0Y' },
      { title: "Tsié", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=uJjnPnyz_1U' },
      { title: "Pour Mieux Repartir", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=x-W1ukKqZPE' },
      { title: "Na Ghu", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=k7bUf1U2Ge0' },
    ],
  },
  {
    title: "Temoignage Live At Olympia",
    year: 2010,
    slug: 'temoignage-live-at-olympia',
    format: "CD",
    label: "Wgs Gabon (001)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Bisse Ngabu", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=e5BZZSzQiug' },
      { title: "Kodu No Kodu", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=k7bUf1U2Ge0' },
      { title: "Ni Wu Rondi", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=ghtzucMYCSs' },
      { title: "A Nos Anges", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=Ne2c0S9rrxM' },
      { title: "Kokolu", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=BXtfjGMF0EY' },
      { title: "Mulimbu", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=qT5pSnELqV4' },
      { title: "Yitu", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=pYv7bEU5H9c' },
      { title: "Nangule", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=He0vvBNFMbc' },
      { title: "Kabiyombo Et Togongo", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=W1vTKFQY4XQ' },
      { title: "Aboume Nzame", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=W1vTKFQY4XQ' },
      { title: "Sans Oublié L'Oublié", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=AqvDg8oFQLk' },
      { title: "Murime Na Murime", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=NUhxPPncSJQ' },
      { title: "Présentations Musiciens", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=n7s0PEEDSuU' },
      { title: "Afrique Mon Toit", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=ifZt92CGzfg' },
      { title: "Le Chant C'Est Mon Champ", track_number: 15, youtube_url: 'https://www.youtube.com/watch?v=dkbmNjBWvQY' },
    ],
  },
  {
    title: "De Mighoma Pour Vousss...",
    year: 2011,
    slug: 'de-mighoma-pour-vousss',
    format: "CD",
    label: "AFB Music",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "C'Est Ma Griffe NWR", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=5hWNP1ROETU' },
      { title: "Léo", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=EeD7jqbLhS4' },
      { title: "Peuple Gabonais", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Zn6DJp3Uidw' },
      { title: "IIely (Le Cri De Détresse)", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=Eywi111PsJo' },
      { title: "Yessu (Jésus)", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=IL2_tP63MAI' },
      { title: "Horizons Nouveaux", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=CFeKQvyR5bM' },
      { title: "Yitu (Espoir)", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=ceOsVxwn9-0' },
      { title: "Smn", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=JIgJNCMom_E' },
      { title: "La Totale", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=MG4acwHy-Xs' },
      { title: "Du Vovu (Le Silence)", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=dkbmNjBWvQY' },
      { title: "S.O.S Seigneur", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=kLlqth44icA' },
      { title: "A Nos Anges", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=Ne2c0S9rrxM' },
      { title: "Bisse Ngabu (Les Gabonais)", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=HP09B2NNYRY' },
      { title: "Kokolu (Pardon)", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=0C7vB2R0VTE' },
      { title: "Va Yilu (Fait Dodo)", track_number: 15, youtube_url: 'https://www.youtube.com/watch?v=TfVPfezWMkE' },
    ],
  },
  {
    title: "Mon Point Zérooo",
    year: 2012,
    slug: 'mon-point-zerooo',
    format: "CD",
    label: "not on label",
    genre: "Pop / Folk, World, & Country",
    description: "",
    credits: null,
    tracks: [
      { title: "Missamu", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=2jySaTtdndA' },
      { title: "Moine Vole", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=oJ3dJ6lO1Tk' },
      { title: "Le Chant C'Est Mon Champ", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=dkbmNjBWvQY' },
      { title: "Tsé QuandT'Es", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=BKTukNXE6r4' },
      { title: "Ni Wou Rondi", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=ghtzucMYCSs' },
      { title: "Je T'Invite", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=JIgJNCMom_E' },
      { title: "Bisse Ngabu", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=e5BZZSzQiug' },
      { title: "Warisse", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=O9u6hm12tuo' },
      { title: "Tsié", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=uJjnPnyz_1U' },
      { title: "Ba Mossi", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=yxu-1ocC9Po' },
      { title: "L'Amour Et La Paix Vont De Paire", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=mmVE16mmNBw' },
      { title: "Yitu", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=pYv7bEU5H9c' },
      { title: "Diboty", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=20JUbt0_oGg' },
      { title: "Léo", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=EeD7jqbLhS4' },
      { title: "Nougaro", track_number: 15, youtube_url: 'https://www.youtube.com/watch?v=EK3Y2qrgH0Y' },
      { title: "Sénégal", track_number: 16, youtube_url: 'https://www.youtube.com/watch?v=_0CRAWPRd_M' },
      { title: "A Nos Anges", track_number: 17, youtube_url: 'https://www.youtube.com/watch?v=Ne2c0S9rrxM' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Annie-Flore Batchiellilys...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Annie-Flore Batchiellilys',
      slug: 'annie-flore-batchiellilys',
      bio: ANNIE_FLORE_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1967,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: ANNIE_FLORE_BIO, name: 'Annie-Flore Batchiellilys' } })
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

  for (const disc of ANNIE_FLORE_DISCOGRAPHY) {
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
