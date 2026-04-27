import Link from 'next/link';
import { db } from '@/db';
import { artists } from '@/db/schema';

export default async function HomePage() {
  let artistList: { id: string; name: string; slug: string }[] = [];
  try {
    artistList = await db.select({ id: artists.id, name: artists.name, slug: artists.slug }).from(artists);
  } catch {
    // DB non configurée — fallback statique
  }

  return (
    <main className="min-h-screen bg-[#0d1a0d] flex flex-col items-center justify-center px-6">
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234a7c59' fill-opacity='1'%3E%3Cpath d='M40 0 L45 20 L60 10 L50 25 L70 22 L55 35 L70 45 L50 42 L55 60 L40 50 L25 60 L30 42 L10 45 L25 35 L10 22 L30 25 L20 10 L35 20 Z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '160px',
        }}
      />

      <div className="relative z-10 text-center max-w-2xl">
        <p className="text-[#4a7c59] text-xs uppercase tracking-[0.3em] mb-6">Sanctuaire Numérique</p>

        <h1 className="text-7xl md:text-9xl font-bold text-white font-serif mb-4 tracking-tight">
          Afan
        </h1>

        <p className="text-[#a3c9a8]/60 text-sm mb-2 font-serif italic">
          "La Forêt" — en langue Fang
        </p>

        <p className="text-white/40 text-base leading-relaxed mt-6 mb-12">
          Un espace vivant pour préserver, partager et transmettre<br />
          le patrimoine musical du Gabon.
        </p>

        <div className="flex flex-col gap-3">
          <p className="text-[#2a4a2a] text-xs uppercase tracking-widest mb-2">Les arbres de la forêt</p>

          {artistList.length > 0 ? (
            artistList.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.slug}`}
                className="group inline-flex items-center gap-3 px-6 py-4 rounded-lg border border-[#2a4a2a] hover:border-[#4a7c59] bg-[#0d1a0d] hover:bg-[#1a2e1a] transition-all"
              >
                <span className="text-[#4a7c59] text-lg">🌳</span>
                <span className="text-white/80 group-hover:text-white font-medium transition-colors">
                  {artist.name}
                </span>
                <span className="text-[#2a4a2a] text-xs ml-auto group-hover:text-[#4a7c59] transition-colors">
                  Explorer →
                </span>
              </Link>
            ))
          ) : (
            <Link
              href="/artist/pierre-claver-zeng"
              className="group inline-flex items-center gap-3 px-6 py-4 rounded-lg border border-[#2a4a2a] hover:border-[#4a7c59] bg-[#0d1a0d] hover:bg-[#1a2e1a] transition-all"
            >
              <span className="text-[#4a7c59] text-lg">🌳</span>
              <span className="text-white/80 group-hover:text-white font-medium transition-colors">
                Pierre-Claver Zeng Ebome
              </span>
              <span className="text-[#2a4a2a] text-xs ml-auto group-hover:text-[#4a7c59] transition-colors">
                Explorer →
              </span>
            </Link>
          )}
        </div>

        <p className="text-[#1a2e1a] text-xs mt-16">open-source · Gabon · 2025</p>
      </div>
    </main>
  );
}
