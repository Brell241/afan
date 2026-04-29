import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { Music2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';
import { AlbumNav } from '@/components/album/AlbumNav';
import { AlbumCoverUpload } from '@/components/album/AlbumCoverUpload';
import { TracklistWithSheet } from '@/components/album/TracklistWithSheet';

const HERO_HEIGHT = 320;

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string; albumSlug: string }>;
}) {
  const { slug, albumSlug } = await params;

  if (!process.env.DATABASE_URL) notFound();

  const [artist] = await db.select().from(artists).where(eq(artists.slug, slug));
  if (!artist) notFound();

  const [album] = await db
    .select()
    .from(albums)
    .where(and(eq(albums.artist_id, artist.id), eq(albums.slug, albumSlug)));
  if (!album) notFound();

  const albumTracks = await db
    .select()
    .from(tracks)
    .where(eq(tracks.album_id, album.id))
    .orderBy(tracks.track_number);

  const creditsList = album.credits?.split(' · ') ?? [];

  return (
    <div className="min-h-screen bg-[#121212]">

      <AlbumNav
        artistName={artist.name}
        artistSlug={artist.slug}
        albumTitle={album.title}
        heroHeight={HERO_HEIGHT}
      />

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ minHeight: HERO_HEIGHT }}>

        {/* Fond — image de l'album très floutée, agrandie pour éviter les bords blancs */}
        {album.image_url ? (
          <div
            className="absolute"
            style={{
              inset: '-12%',
              backgroundImage: `url(${album.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(55px) brightness(0.28) saturate(1.4)',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#121212]" />
        )}

        {/* Dégradés de finition */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/50 to-transparent" style={{ height: '30%' }} />

        {/* Contenu du hero */}
        <div
          className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 flex flex-col justify-end"
          style={{ minHeight: HERO_HEIGHT, paddingBottom: '2rem', paddingTop: '3.5rem' }}
        >
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-end">

            {/* Pochette */}
            <div className="shrink-0">
              <AlbumCoverUpload albumId={album.id} imageUrl={album.image_url} />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] mb-2">
                Album{album.format ? ` · ${album.format}` : ''}
              </p>
              <h1 className="font-black text-white leading-[0.9] tracking-tight mb-4"
                style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)' }}>
                {album.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <Link
                  href={`/artist/${slug}`}
                  className="text-white font-semibold hover:underline underline-offset-4 transition-all"
                >
                  {artist.name}
                </Link>
                {album.year && (
                  <><span className="text-white/20">·</span><span className="text-white/55">{album.year}</span></>
                )}
                {album.label && (
                  <><span className="text-white/20">·</span><span className="text-white/40">{album.label}</span></>
                )}
                {albumTracks.length > 0 && (
                  <><span className="text-white/20">·</span>
                  <span className="text-white/40">{albumTracks.length} titre{albumTracks.length !== 1 ? 's' : ''}</span></>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {album.description && (
            <p className="mt-5 text-white/40 text-sm leading-relaxed max-w-2xl">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">

        {/* Tracklist */}
        <section className="mb-12">
          <div className="flex items-center justify-between py-3 border-b border-white/[0.07] mb-2">
            <span className="text-white/25 text-[10px] uppercase tracking-widest">#</span>
            <span className="flex-1 ml-4 text-white/25 text-[10px] uppercase tracking-widest">Titre</span>
            <Music2 size={13} className="text-white/25" />
          </div>
          <TracklistWithSheet tracks={albumTracks} album={album} artist={{ name: artist.name, slug: artist.slug }} />
        </section>

        {/* Crédits */}
        {creditsList.length > 0 && (
          <section className="mb-12 p-6 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Musiciens</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {creditsList.map((c, i) => (
                <p key={i} className="text-white/55 text-sm">{c}</p>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
