export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { Disc3, Music2, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';
import { count, desc, sql, eq } from 'drizzle-orm';
import { HomeArtistList } from '@/components/HomeArtistList';
import { HomeNav } from '@/components/HomeNav';
import { AdminPanel } from '@/components/AdminPanel';

interface TopTrack {
  id: string;
  title: string;
  image_url: string | null;
  album_title: string;
  album_slug: string;
  artist_name: string;
  artist_slug: string;
  play_count: number;
}

interface TopArtist {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  photo_url: string | null;
  play_count: number;
}

export default async function HomePage() {
  let artistList: { id: string; name: string; slug: string; bio: string | null; photo_url: string | null; avatar_url: string | null }[] = [];
  let totalAlbums = 0;
  let totalTracks = 0;
  let topTrack: TopTrack | null = null;
  let topArtist: TopArtist | null = null;

  try {
    artistList = await db.select({
      id: artists.id,
      name: artists.name,
      slug: artists.slug,
      bio: artists.bio,
      photo_url: artists.photo_url,
      avatar_url: artists.avatar_url,
    }).from(artists);
    const [a] = await db.select({ value: count() }).from(albums);
    const [t] = await db.select({ value: count() }).from(tracks);
    totalAlbums = Number(a?.value ?? 0);
    totalTracks = Number(t?.value ?? 0);

    const startOfMonth = sql`date_trunc('month', now())`;

    const topTrackRows = await db.execute<{
      id: string; title: string; image_url: string | null;
      album_title: string; album_slug: string;
      artist_name: string; artist_slug: string; play_count: string;
    }>(sql`
      SELECT t.id, t.title, COALESCE(t.image_url, al.image_url) as image_url,
             al.title as album_title, al.slug as album_slug,
             ar.name as artist_name, ar.slug as artist_slug,
             COUNT(p.id)::int as play_count
      FROM plays p
      JOIN tracks t ON t.id = p.track_id
      JOIN albums al ON al.id = t.album_id
      JOIN artists ar ON ar.id = al.artist_id
      WHERE p.played_at >= ${startOfMonth}
      GROUP BY t.id, t.title, t.image_url, al.image_url, al.title, al.slug, ar.name, ar.slug
      ORDER BY play_count DESC
      LIMIT 1
    `);

    if (topTrackRows.rows.length > 0) {
      const r = topTrackRows.rows[0];
      topTrack = { ...r, play_count: Number(r.play_count) };
    }

    const topArtistRows = await db.execute<{
      id: string; name: string; slug: string;
      avatar_url: string | null; photo_url: string | null; play_count: string;
    }>(sql`
      SELECT ar.id, ar.name, ar.slug, ar.avatar_url, ar.photo_url,
             COUNT(p.id)::int as play_count
      FROM plays p
      JOIN tracks t ON t.id = p.track_id
      JOIN albums al ON al.id = t.album_id
      JOIN artists ar ON ar.id = al.artist_id
      WHERE p.played_at >= ${startOfMonth}
      GROUP BY ar.id, ar.name, ar.slug, ar.avatar_url, ar.photo_url
      ORDER BY play_count DESC
      LIMIT 1
    `);

    if (topArtistRows.rows.length > 0) {
      const r = topArtistRows.rows[0];
      topArtist = { ...r, play_count: Number(r.play_count) };
    }
  } catch {}

  const fallback = [{
    id: 'pcz',
    name: 'Pierre-Claver Zeng Ebome',
    slug: 'pierre-claver-zeng',
    bio: 'Le Dernier Poète Fang. Chantre du patrimoine musical gabonais, 8 albums entre 1970 et 2005.',
    photo_url: null,
    avatar_url: null,
  }];
  const list = artistList.length > 0 ? artistList : fallback;

  const hasTrends = topTrack || topArtist;
  const monthName = new Date().toLocaleString('fr-FR', { month: 'long' });

  return (
    <div className="min-h-screen bg-[#121212]">

      {/* ── NAV ── */}
      <HomeNav />

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <p className="text-[#B3B3B3] text-xs uppercase tracking-[0.25em] mb-6">
          Sanctuaire Numérique · Gabon · Open Source
        </p>

        <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-black text-white leading-none tracking-tighter mb-6">
          La Forêt<br />
          <span className="text-[#1DB954]">Musicale</span>
        </h1>

        <p className="text-[#B3B3B3] text-lg max-w-lg leading-relaxed mb-12">
          Afan préserve le patrimoine musical gabonais.
          Chaque artiste est un arbre. Chaque contribution, une racine de plus.
        </p>

        <Link
          href={`/artist/${list[0]?.slug ?? 'pierre-claver-zeng'}`}
          className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm px-8 py-4 rounded-full transition-colors"
        >
          Entrer dans la forêt
          <ArrowRight size={16} />
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-20 text-center">
          {[
            { icon: Users, value: list.length, label: 'Artiste' },
            { icon: Disc3, value: totalAlbums || 8, label: 'Albums' },
            { icon: Music2, value: totalTracks || 24, label: 'Titres' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <p className="text-white font-black text-4xl">{value}</p>
              <p className="text-[#B3B3B3] text-xs mt-1 flex items-center gap-1 justify-center">
                <Icon size={10} /> {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TENDANCES DU MOIS ── */}
      {hasTrends && (
        <section className="border-t border-white/5 max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp size={16} className="text-[#1DB954]" />
            <h2 className="text-white font-bold text-xl">
              Tendances de {monthName}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topTrack && (
              <Link
                href={`/artist/${topTrack.artist_slug}/album/${topTrack.album_slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                  {topTrack.image_url ? (
                    <Image src={topTrack.image_url} alt={topTrack.title} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <Music2 size={20} className="text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1DB954] text-[10px] font-bold uppercase tracking-widest mb-0.5">Titre le plus écouté</p>
                  <p className="text-white font-semibold text-sm truncate">{topTrack.title}</p>
                  <p className="text-[#B3B3B3] text-xs truncate">{topTrack.artist_name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-white font-black text-lg">{topTrack.play_count}</p>
                  <p className="text-white/30 text-[10px]">écoute{topTrack.play_count !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            )}

            {topArtist && (
              <Link
                href={`/artist/${topArtist.slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition-colors"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                  {(topArtist.avatar_url ?? topArtist.photo_url) ? (
                    <Image src={(topArtist.avatar_url ?? topArtist.photo_url)!} alt={topArtist.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <Users size={20} className="text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1DB954] text-[10px] font-bold uppercase tracking-widest mb-0.5">Artiste le plus écouté</p>
                  <p className="text-white font-semibold text-sm truncate">{topArtist.name}</p>
                  <p className="text-[#B3B3B3] text-xs">Ce mois-ci</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-white font-black text-lg">{topArtist.play_count}</p>
                  <p className="text-white/30 text-[10px]">écoute{topArtist.play_count !== 1 ? 's' : ''}</p>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── ARTISTES ── */}
      <div id="artistes">
        <HomeArtistList artists={list} />
      </div>

      {/* ── COMMENT CA MARCHE ── */}
      <section className="border-t border-white/5 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-white font-bold text-2xl mb-10">Comment ça marche</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Explore', desc: 'Navigue dans les discographies, écoute les titres et lis les paroles en Français et en Fang.' },
            { n: '02', title: 'Contribue', desc: 'Propose des paroles, des anecdotes, des liens ou des photos pour enrichir chaque fiche.' },
            { n: '03', title: 'Préserve', desc: 'Chaque contribution est validée pour former une archive fiable et accessible à tous.' },
          ].map(({ n, title, desc }) => (
            <div key={n}>
              <p className="text-[#1DB954] text-xs font-bold mb-3">{n}</p>
              <p className="text-white font-semibold mb-2">{title}</p>
              <p className="text-[#B3B3B3] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADMIN (dev only) ── */}
      {process.env.NODE_ENV === 'development' && <AdminPanel />}

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-[#B3B3B3] text-xs font-bold">afan</span>
        <div className="flex items-center gap-4">
          <Link href="/a-propos" className="text-[#535353] hover:text-[#B3B3B3] text-xs transition-colors">À propos</Link>
          <span className="text-[#535353] text-xs">open-source · Gabon · 2025</span>
        </div>
      </footer>
    </div>
  );
}
