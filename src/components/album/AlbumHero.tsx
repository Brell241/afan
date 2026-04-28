'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ImageUploadButton } from '@/components/upload/ImageUploadButton';
import type { Album, Artist } from '@/db/schema';

interface AlbumHeroProps {
  album: Album;
  artist: Artist;
}

export function AlbumHero({ album, artist }: AlbumHeroProps) {
  const [currentImage, setCurrentImage] = useState(album.image_url);
  const creditsList = album.credits?.split(' · ') ?? [];

  return (
    <>
      {/* ── BANNER façon YouTube ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '280px' }}>
        {/* Fond : image floue ou gradient */}
        {currentImage ? (
          <>
            <Image src={currentImage} alt="" fill className="object-cover scale-110 blur-xl brightness-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a0a]" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, #1a3a28 0%, #0f2018 50%, #0a0a0a 100%)`,
            }}
          />
        )}

        {/* Bouton upload banner discret */}
        <div className="absolute top-3 right-3 z-20">
          <ImageUploadButton
            endpoint={`/api/upload/album/${album.id}`}
            onSuccess={setCurrentImage}
            label="Changer la pochette"
          />
        </div>
      </div>

      {/* ── INFO BAR (pochette + métadonnées) ── */}
      <div className="relative bg-[#0a0a0a] px-8">
        {/* Pochette flottante sur le banner */}
        <div className="flex items-end gap-6" style={{ marginTop: '-80px' }}>
          <div className="relative group shrink-0 z-10">
            <div className="w-40 h-40 rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-[#1e1e1e]">
              {currentImage ? (
                <Image src={currentImage} alt={album.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a3a28] to-[#0a1a10]">
                  <span className="text-5xl opacity-20">🌿</span>
                  <span className="text-white/20 text-xs font-mono">{album.year}</span>
                </div>
              )}
            </div>

            {/* Upload overlay sur pochette */}
            <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageUploadButton
                endpoint={`/api/upload/album/${album.id}`}
                onSuccess={setCurrentImage}
                label="Pochette"
                className="text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Métadonnées */}
          <div className="flex-1 min-w-0 pb-4 relative z-10">
            <Link
              href={`/artist/${artist.slug}`}
              className="text-[#4ade80] text-xs font-medium hover:underline underline-offset-4 transition-all"
            >
              ← {artist.name}
            </Link>

            <h1 className="text-3xl md:text-4xl font-black text-white mt-1 tracking-tight leading-tight">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-white/70 text-sm font-semibold">{album.year}</span>
              {album.format && (
                <span className="text-[10px] font-mono bg-[#1e1e1e] text-[#4ade80] px-2 py-0.5 rounded-full border border-white/10">
                  {album.format}
                </span>
              )}
              {album.genre && (
                <span className="text-white/30 text-xs">· {album.genre}</span>
              )}
              {album.label && (
                <span className="text-white/25 text-xs">· {album.label}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description + crédits */}
        {(album.description || creditsList.length > 0) && (
          <div className="mt-6 pb-6 border-b border-white/5 grid md:grid-cols-2 gap-6">
            {album.description && (
              <p className="text-white/50 text-sm leading-relaxed">{album.description}</p>
            )}
            {creditsList.length > 0 && (
              <div>
                <p className="text-white/25 text-xs uppercase tracking-widest mb-3">Musiciens</p>
                <div className="space-y-1.5">
                  {creditsList.map((c, i) => (
                    <p key={i} className="text-white/50 text-sm">{c}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
