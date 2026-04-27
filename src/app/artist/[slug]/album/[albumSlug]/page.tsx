'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlbumHero } from '@/components/album/AlbumHero';
import { Tracklist } from '@/components/album/Tracklist';
import { ContributionForm } from '@/components/album/ContributionForm';
import { Button } from '@/components/ui/button';
import type { Artist, Album, Track } from '@/db/schema';

interface AlbumData {
  artist: Artist;
  album: Album;
  tracks: Track[];
}

export default function AlbumPage() {
  const params = useParams<{ slug: string; albumSlug: string }>();
  const [data, setData] = useState<AlbumData | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/album/${params.slug}/${params.albumSlug}`)
      .then((r) => r.json())
      .then(setData);
  }, [params.slug, params.albumSlug]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center">
        <span className="text-[#2a4a2a] text-sm animate-pulse">Chargement...</span>
      </div>
    );
  }

  const { artist, album, tracks } = data;

  return (
    <main className="min-h-screen bg-[#0d1a0d]">
      <AlbumHero album={album} artist={artist} />

      <div className="container mx-auto px-6 py-10 max-w-3xl">
        {/* Tracklist */}
        <section className="mb-12">
          <h2 className="text-lg font-serif text-white/80 mb-1">Titres</h2>
          <p className="text-[#4a7c59] text-xs uppercase tracking-widest mb-5">Tracklist</p>
          <Tracklist tracks={tracks} />
        </section>

        {/* Section contribution */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-serif text-white/80">Paroles & Sens</h2>
              <p className="text-[#4a7c59] text-xs uppercase tracking-widest">Contribuer à la mémoire</p>
            </div>
            <Button
              onClick={() => setContributeOpen(true)}
              className="bg-[#1a2e1a] border border-[#2a4a2a] text-[#a3c9a8] hover:bg-[#2a4a2a] hover:text-white text-sm"
            >
              + Contribuer
            </Button>
          </div>

          {tracks.length === 0 ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-[#2a4a2a]">
              <p className="text-white/30 text-sm">
                Aucune donnée pour cet album. Sois le premier à contribuer.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tracks.filter((t) => t.lyrics_fr || t.lyrics_original).map((track) => (
                <div key={track.id} className="border border-[#1a2e1a] rounded-lg p-5">
                  <h3 className="text-white/70 text-sm font-medium mb-3">{track.title}</h3>
                  {track.lyrics_fr && (
                    <div>
                      <p className="text-[#4a7c59] text-xs uppercase tracking-widest mb-2">Français</p>
                      <pre className="text-white/60 text-sm leading-8 whitespace-pre-wrap font-serif">
                        {track.lyrics_fr}
                      </pre>
                    </div>
                  )}
                  {track.lyrics_original && (
                    <div className="mt-4">
                      <p className="text-[#4a7c59] text-xs uppercase tracking-widest mb-2">Fang</p>
                      <pre className="text-white/60 text-sm leading-8 whitespace-pre-wrap font-serif">
                        {track.lyrics_original}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ContributionForm
        albumId={album.id}
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
      />
    </main>
  );
}
