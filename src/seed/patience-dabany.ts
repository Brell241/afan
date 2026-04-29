import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { artists, albums, tracks } from '../db/schema';
import { eq } from 'drizzle-orm';

const PATIENCE_DABANY_BIO = `Patience Dabany, de son vrai nom Marie-Joséphine Kama, née le 1945 à Brazzaville, est une artiste musicienne gabonaise, également femme politique.`;

const PATIENCE_DABANY_DISCOGRAPHY = [
  {
    title: "Patience 2",
    year: 1985,
    slug: 'patience-2',
    format: "Vinyl",
    label: "Nkoussou Music",
    genre: "Folk, World, & Country / African",
    description: "Made in France",
    credits: 'Arranged By [Horn & String] : Delbert Taylor · Backing Vocals : André Malemba · Bass : Djoni Davis · Conductor : Georges Oyenzé · Congas : Kantoula Mbemba J.B. · Drums : Benoit Lendjet · Engineer : Bob Winard · Executive-Producer : Jade Sound',
    tracks: [
      { title: "J'Ai Le Cafard", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=jrpmcs-_aM0' },
      { title: "Leku Mandzila", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=E03IhS76HPQ' },
      { title: "We Mamiobi", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=zCOAH_pXAyM' },
      { title: "Kelele", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=-kQorn2XnV4' },
    ],
  },
  {
    title: "Patience 3",
    year: 1985,
    slug: 'patience-3',
    format: "Vinyl",
    label: "Nkoussou Music",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: 'Co-producer : Fred Wesley · Producer : Patience Dabany',
    tracks: [
      { title: "Weekend A Moanda", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=0xhPnPOaHlA' },
      { title: "Kifio Nini", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=9vQGIVXS7d8' },
      { title: "Ngabule", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Rj8hgh2khyg' },
      { title: "Mbila", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=bDzDM0wMzCw' },
    ],
  },
  {
    title: "Patience 1",
    year: 1985,
    slug: 'patience-1',
    format: "Vinyl",
    label: "Nkoussou Music",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Patience", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
      { title: "Maimouna", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=tdECF-ScRyI' },
      { title: "Djuby Wangu", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=CNtiU6uQo6A' },
      { title: "Mwa Nana", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=qFpl4Pp0VRk' },
    ],
  },
  {
    title: "Patience 4",
    year: 1985,
    slug: 'patience-4',
    format: "Vinyl",
    label: "Nkoussou Music",
    genre: "Reggae / Funk / Soul",
    description: "",
    credits: 'Arranged By [Horn & String] : Fred Wesley · Backing Vocals : André Malemba · Bass Guitar : Djoni Davis · Concertmaster : William Henderson (2) · Congas [Tumbas] : Kantoula Mbemba J.B. · Drums : Benoit Lendjet · Engineer : Bob Winard · Engineer [Recording] : Marie-Claire Bertrand',
    tracks: [
      { title: "Le Monde Est Méchant", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=Jk_hkqOQEk4' },
      { title: "Je T'Aime Crois-Moi", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=2wQac9AboEs' },
      { title: "Kalima", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=5C3UtKpr97Q' },
      { title: "Soyons-Unis", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=0iomQV41CWc' },
    ],
  },
  {
    title: "Patience 5",
    year: 1985,
    slug: 'patience-5',
    format: "Vinyl",
    label: "Nkoussou Music",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Ombele", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=rRbiiuCL-ag' },
      { title: "Amour Temporaire", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=L5kJenaDoXI' },
      { title: "Felie", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=DSQM1c1mWcY' },
      { title: "Betty", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=7mCANu3SUEQ' },
    ],
  },
  {
    title: "Associe II",
    year: 1987,
    slug: 'associe-ii',
    format: "CD",
    label: "Independiente (#2)",
    genre: "Classical / Electronic",
    description: "",
    credits: 'Dj, Producer : Diego García',
    tracks: [
      { title: "Nuclear Virus", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=37_EqtJVkAY' },
      { title: "Toxic Waste Manager", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
      { title: "Techno Logic Radiation House", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=YLG2cA0dL_M' },
      { title: "Year 3000(Jonas Brothers Cover)", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=JioTL2uEXrg' },
      { title: "I'm, I'm, I'm(Like No Other)", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
      { title: "The Stars Are Rain", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=Gibxvd7ROMo' },
      { title: "Dangerous", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
      { title: "Synthpop", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=OjCVzJnxSNo' },
      { title: "BB Good", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=XsDMPc2qAV0' },
      { title: "Hasta Donde(The Love Chronicle)", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=Gibxvd7ROMo' },
      { title: "Hold On", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "Inseparable", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
      { title: "Video Girl", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=9jg9xAoolx4' },
      { title: "Don't Take My Heart And Put It On A Shelf", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=Gibxvd7ROMo' },
    ],
  },
  {
    title: "Bon Anniversaire",
    year: 1988,
    slug: 'bon-anniversaire',
    format: "Vinyl",
    label: "Dabany Productions",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Obagui Ndoumou", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=s7fgfbVS8j8' },
      { title: "Ayanga", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=AaqOBdoVq0o' },
      { title: "Bon Anniversaire", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Hu6VobqRJyU' },
      { title: "Bon Anniversaire / Kassuere (Ndjobi Folklore)", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=Hu6VobqRJyU' },
    ],
  },
  {
    title: "Gaella",
    year: 1990,
    slug: 'gaella',
    format: "CDr",
    label: "IXOHOXI Music",
    genre: "Electronic / Tribal",
    description: "All music composed, performed and recorded by IXOHOXI at Thetawave studios in the USA\r\n\r\ncopyright 2006 by IXOHOXI",
    credits: null,
    tracks: [
      { title: "The Acolytes Invocation And Ritual", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=9BzeL0UA-Ls' },
      { title: "The Snake And The Temple", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=7JwvlR7hbiA' },
      { title: "Soundscape Aquamarine", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=hx8Dri__tko' },
      { title: "Soundscape Beryllium", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=HAYnDOO8esI' },
      { title: "Soundscape Obsidian", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=GRj6691DY_k' },
      { title: "Soundscape Spectrolite", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=Gibxvd7ROMo' },
      { title: "Spice Melange", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=TcR17gY_qCo' },
      { title: "Soundscape Tanzanite", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=m3LxpuulIyM' },
      { title: "Soundscape Feldspar", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=OjCVzJnxSNo' },
    ],
  },
  {
    title: "Jalousie / Sango Ya Mawa",
    year: 1991,
    slug: 'jalousie-sango-ya-mawa',
    format: "Vinyl",
    label: "Dabany Productions",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Jalousie", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=bUfDfmunAys' },
      { title: "Sango Ya Mawa", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=qETuA2ITckE' },
    ],
  },
  {
    title: "Dia",
    year: 1991,
    slug: 'dia',
    format: "Vinyl",
    label: "Dabany Productions (DP-501)",
    genre: "Folk, World, & Country / African",
    description: "It's ok.",
    credits: null,
    tracks: [
      { title: "Dia", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=1MTY3xc_mYo' },
      { title: "Reviens Cheri", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=CPF0cc3UDsY' },
      { title: "Pitié", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=R5O7CGq58zo' },
      { title: "Jalousie", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=bUfDfmunAys' },
      { title: "Kelio", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=CwA_Gnem3q0' },
      { title: "Sango Ya Mawa", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=qETuA2ITckE' },
      { title: "Levekisha", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=Us8QcGG7H8Q' },
      { title: "Dounia", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
    ],
  },
  {
    title: "Fly Girl / Someday",
    year: 1991,
    slug: 'fly-girl-someday',
    format: "CD",
    label: "Epic (EK 62189)",
    genre: "Rock / Rock & Roll",
    description: "Edited version with the first track listed as \"XXXXin' In The Bushes\" and edited sample. DIDP 100122 code printed on disc.",
    credits: null,
    tracks: [
      { title: "Fuckin' In The Bushes", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=rJU387EAb5c' },
      { title: "Go Let It Out", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=2FN_FSJxwJY' },
      { title: "Who Feels Love?", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=HB7XdnAh0Bo' },
      { title: "Put Yer Money Where Yer Mouth Is", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=OjCVzJnxSNo' },
      { title: "Little James", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "Gas Panic!", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=HNpNpm3Bajc' },
      { title: "Where Did It All Go Wrong?", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=NcVir8uamC4' },
      { title: "Sunday Morning Call", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=-51-0Mx_n0w' },
      { title: "I Can See A Liar", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=OD0cO0InJQI' },
      { title: "Roll It Over", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=2YVzozwZu0Q' },
    ],
  },
  {
    title: "Kelio",
    year: 1992,
    slug: 'kelio',
    format: "Cassette",
    label: "Dabany Productions (DP-501)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: null,
    tracks: [
      { title: "Kelio", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=CwA_Gnem3q0' },
      { title: "Sango Ya Mawa", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=qETuA2ITckE' },
      { title: "Levekisha", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=Us8QcGG7H8Q' },
      { title: "Dounia", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
    ],
  },
  {
    title: "Chéri Ton Disque Est Rayé",
    year: 1995,
    slug: 'cheri-ton-disque-est-raye',
    format: "Vinyl",
    label: "Dreckchords Records (DCR 03)",
    genre: "Rock / Thrash",
    description: "",
    credits: null,
    tracks: [
      { title: "Go Away Motherfucker", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=Fkze0JvrnIY' },
      { title: "Malt Alles Voll", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "Bullen Sind Cool", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=hx8Dri__tko' },
      { title: "Work Eat Fuck Sleep", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=G0_EvRNvnCk' },
      { title: "Drei Zwei Eins Deins", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=xkjrktAOiHo' },
      { title: "Machine People Philosophy", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=IvxxW8nm3gs' },
      { title: "Fleischwurst Kindergeburtstagsparty", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=b8BuXk4I7V4' },
      { title: "The Unseen Homocaust", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=Gibxvd7ROMo' },
      { title: "Live My Life", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "Muttertag", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "CDU - Sick Of You", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=OjCVzJnxSNo' },
      { title: "Home Is Where Your Head Aches", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=dGrcg4uin0o' },
    ],
  },
  {
    title: "La Vie A Change (Nouvelle Attitude)",
    year: 1997,
    slug: 'la-vie-a-change-nouvelle-attitude',
    format: "CD",
    label: "Dabany Productions",
    genre: "Funk / Soul / Folk, World, & Country",
    description: "",
    credits: null,
    tracks: [
      { title: "La Vie A Change", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=vOkqX7Q-AgI' },
      { title: "Ama Yende", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=EEBVIIG7Bko' },
      { title: "Gnila Yala", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=JfcoifyfeVY' },
      { title: "Fausse Amitie", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=TcR17gY_qCo' },
      { title: "Associe Fache", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=ssKF58x4xsc' },
      { title: "I Can't Say Goodbye", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=OD0cO0InJQI' },
      { title: "Ingr'attitude", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=2YVzozwZu0Q' },
      { title: "Adieu Amissa", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=YEnJVLLNLYM' },
      { title: "Mon'ebone", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=k38vrJxQcGI' },
      { title: "Antsia", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=XEs5smLPDoI' },
    ],
  },
  {
    title: "Article 106",
    year: 2001,
    slug: 'article-106',
    format: "CD",
    label: "PADA International (PADA 002)",
    genre: "Folk, World, & Country / African",
    description: "",
    credits: 'Arranged By, Programmed By : Edgar Yonkeu · Bass : Guy Nsangué · Bass, Guitar : Papy Bass · Chorus : Angèle Assélé · Drums : Espoir Pepa · Guitar, Lead Guitar : Sylvain Kalibi · Lead Vocals, Art Direction, Percussion : Patience Dabany · Percussion [Tumba] : Joel Kassoula',
    tracks: [
      { title: "Melissa", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=qkmJ53E6gOY' },
      { title: "Yanga Yanga", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=ABHMCW_q-zY' },
      { title: "Mili Dza", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=CNtiU6uQo6A' },
      { title: "Ombele", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=rRbiiuCL-ag' },
      { title: "Reve Complique", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=mLmMLwOpS8A' },
      { title: "Tenene", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=KFgWKqBLYj4' },
      { title: "Kala Kala", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=vgLMzaIA3e4' },
      { title: "Maswa", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=LCN6kfP694Y' },
      { title: "Article 06", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=KFgWKqBLYj4' },
      { title: "Tenene (Acoustique)", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=wWr_uhU9rqo' },
    ],
  },
  {
    title: "Obomiyia",
    year: 2004,
    slug: 'obomiyia',
    format: "CD",
    label: "Créon Music (5767202)",
    genre: "Latin / Folk, World, & Country",
    description: "Digipak\n℗ 2004 Créon Music / © 2004 Direct Prod",
    credits: 'Design : Mayval · Photography By : Alain Hermann · Producer, Executive-Producer : Edgar Yonkeu',
    tracks: [
      { title: "Intro", track_number: 1, youtube_url: 'https://www.youtube.com/watch?v=QsKN-fPmojg' },
      { title: "Lea Mono", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=qETuA2ITckE' },
      { title: "We Ovou Omaya", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=1SvAPSqB-4Y' },
      { title: "Obomiya", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=GRj6691DY_k' },
      { title: "Tsongwané (Tata Kombé)", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=awBDyanaE7A' },
      { title: "Dialemi", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=cErC5o7EHZ4' },
      { title: "We Mami Obi", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=zCOAH_pXAyM' },
      { title: "Elinguiwayo", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=yP_surxrnOM' },
      { title: "Ndzira Lorawa", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "Djekoli Mi", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
      { title: "Ayina", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=J3ntHR0pTFU' },
      { title: "Cry", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=OD0cO0InJQI' },
      { title: "Mbomo Awa", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=Zlp8nVbBHVA' },
      { title: "Ikokou (Le Russe)", track_number: 14, youtube_url: 'https://www.youtube.com/watch?v=z-HttGgHXdI' },
      { title: "We Mami Obi (Thème)", track_number: 15, youtube_url: 'https://www.youtube.com/watch?v=zCOAH_pXAyM' },
      { title: "Out Tru", track_number: 16, youtube_url: 'https://www.youtube.com/watch?v=9ToXxRG_gi4' },
    ],
  },
  {
    title: "La Locomotive En Videos",
    year: 2011,
    slug: 'la-locomotive-en-videos',
    format: "DVD",
    label: "Direct Prod",
    genre: "Jazz / Latin",
    description: "",
    credits: null,
    tracks: [
      { title: "C'est Pour la Vie(Salsa New York)", track_number: 2, youtube_url: 'https://www.youtube.com/watch?v=n3qNHumzse0' },
      { title: "Mandoulila", track_number: 3, youtube_url: 'https://www.youtube.com/watch?v=trYxpv6pGNE' },
      { title: "On Vous Connait", track_number: 4, youtube_url: 'https://www.youtube.com/watch?v=8XsKk9Aj4MU' },
      { title: "Le Jazze de la Mama", track_number: 5, youtube_url: 'https://www.youtube.com/watch?v=DSQM1c1mWcY' },
      { title: "Ewawa", track_number: 6, youtube_url: 'https://www.youtube.com/watch?v=Zlp8nVbBHVA' },
      { title: "L'Amour D'une Mere", track_number: 7, youtube_url: 'https://www.youtube.com/watch?v=L5kJenaDoXI' },
      { title: "Allo Allo", track_number: 8, youtube_url: 'https://www.youtube.com/watch?v=Jkuwb8K3GqQ' },
      { title: "Zain Aya", track_number: 9, youtube_url: 'https://www.youtube.com/watch?v=oUXxaZJ-j_U' },
      { title: "Lediande", track_number: 10, youtube_url: 'https://www.youtube.com/watch?v=HNGXBl6F8iY' },
      { title: "Didi Nsui Kami", track_number: 11, youtube_url: 'https://www.youtube.com/watch?v=l5jP3D5W8kI' },
      { title: "C'est Pour La Vie (Rumba)", track_number: 12, youtube_url: 'https://www.youtube.com/watch?v=XsDMPc2qAV0' },
      { title: "Onikra", track_number: 13, youtube_url: 'https://www.youtube.com/watch?v=Hwb5ZWzN7iU' },
      { title: "La Locomotive (Enregistrement Au Studio)", track_number: 15, youtube_url: 'https://www.youtube.com/watch?v=af_JiaIyx8A' },
      { title: "Extrait Du Concert Live (Libreville Et Abidjan)", track_number: 16, youtube_url: 'https://www.youtube.com/watch?v=yizmVE7vQHs' },
    ],
  },
];

export async function seed() {
  console.log('🌱 Démarrage du seed Patience Dabany...\n');

  const [artist] = await db
    .insert(artists)
    .values({
      name: 'Patience Dabany',
      slug: 'patience-dabany',
      bio: PATIENCE_DABANY_BIO,
      photo_url: null,
      avatar_url: null,
      born_year: 1945,
    })
    .onConflictDoUpdate({ target: artists.slug, set: { bio: PATIENCE_DABANY_BIO, name: 'Patience Dabany' } })
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

  for (const disc of PATIENCE_DABANY_DISCOGRAPHY) {
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
