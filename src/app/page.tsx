export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Disc3, Music2, Users, ArrowRight } from 'lucide-react';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';
import { count } from 'drizzle-orm';
import { HomeArtistList } from '@/components/HomeArtistList';
import { HomeNav } from '@/components/HomeNav';

export default async function HomePage() {
  let artistList: { id: string; name: string; slug: string; bio: string | null; photo_url: string | null; avatar_url: string | null }[] = [];
  let totalAlbums = 0;
  let totalTracks = 0;

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
