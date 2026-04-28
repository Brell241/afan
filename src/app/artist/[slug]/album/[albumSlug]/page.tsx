import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Music2, Upload } from 'lucide-react';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';
import { Tracklist } from '@/components/album/Tracklist';
import { ContributionSection } from '@/components/album/ContributionSection';
import { AlbumCoverUpload } from '@/components/album/AlbumCoverUpload';

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

  const hasLyrics = albumTracks.some((t) => t.lyrics_fr || t.lyrics_original);
  const creditsList = album.credits?.split(' · ') ?? [];

  return (
    <div className="min-h-screen bg-[#121212]">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href={`/artist/${slug}`}
            className="flex items-center gap-1.5 text-[#B3B3B3] hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} />
            {artist.name}
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white text-sm font-medium truncate">{album.title}</span>
        </div>
      </nav>

      {/* ── ALBUM HEADER ── */}
      <div className="relative pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 h-80 bg-gradient-to-b from-[#333] to-[#121212]">
          {album.image_url && (
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: `url(${album.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px) brightness(0.8)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-8 pt-10 pb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-end">

            {/* Pochette avec upload */}
            <AlbumCoverUpload albumId={album.id} imageUrl={album.image_url} />

            {/* Infos */}
            <div className="flex-1 min-w-0 pb-2">
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                Album · {album.format}
              </p>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-4">
                {album.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#B3B3B3] text-sm">
                <Link href={`/artist/${slug}`} className="text-white font-semibold hover:underline underline-offset-4">
                  {artist.name}
                </Link>
                {album.year && <><span className="text-white/30">·</span><span>{album.year}</span></>}
                {album.label && <><span className="text-white/30">·</span><span>{album.label}</span></>}
                {albumTracks.length > 0 && <><span className="text-white/30">·</span><span>{albumTracks.length} titre{albumTracks.length !== 1 ? 's' : ''}</span></>}
              </div>
            </div>
          </div>

          {/* Description */}
          {album.description && (
            <p className="mt-5 text-[#B3B3B3] text-sm leading-relaxed max-w-2xl">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-8 pb-16">

        {/* Tracklist */}
        <section className="mb-12">
          <div className="flex items-center justify-between py-3 border-b border-white/10 mb-2">
            <span className="text-[#B3B3B3] text-xs uppercase tracking-widest">#</span>
            <span className="flex-1 ml-4 text-[#B3B3B3] text-xs uppercase tracking-widest">Titre</span>
            <span className="text-[#B3B3B3] text-xs uppercase tracking-widest">
              <Music2 size={14} />
            </span>
          </div>
          <Tracklist tracks={albumTracks} album={album} artist={{ name: artist.name, slug: artist.slug }} />
        </section>

        {/* Crédits */}
        {creditsList.length > 0 && (
          <section className="mb-12 p-6 rounded-lg bg-[#181818]">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Musiciens</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {creditsList.map((c, i) => (
                <p key={i} className="text-[#B3B3B3] text-sm">{c}</p>
              ))}
            </div>
          </section>
        )}

        {/* Contributions */}
        <section className="border-t border-white/10 pt-8">
          <ContributionSection albumId={album.id} hasLyrics={hasLyrics} />

          {hasLyrics && (
            <div className="mt-6 space-y-4">
              {albumTracks.filter((t) => t.lyrics_fr || t.lyrics_original).map((track) => (
                <div key={track.id} className="p-6 rounded-lg bg-[#181818]">
                  <h3 className="text-white font-semibold mb-4">{track.title}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {track.lyrics_fr && (
                      <div>
                        <p className="text-[#1DB954] text-xs font-bold uppercase tracking-widest mb-3">Français</p>
                        <pre className="text-[#B3B3B3] text-sm leading-8 whitespace-pre-wrap">{track.lyrics_fr}</pre>
                      </div>
                    )}
                    {track.lyrics_original && (
                      <div>
                        <p className="text-[#1DB954] text-xs font-bold uppercase tracking-widest mb-3">Fang</p>
                        <pre className="text-[#B3B3B3] text-sm leading-8 whitespace-pre-wrap">{track.lyrics_original}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
