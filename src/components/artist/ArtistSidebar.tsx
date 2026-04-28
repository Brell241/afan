'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Disc3, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface ArtistSidebarProps {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  albumCount: number;
  yearStart?: number | null;
  yearEnd?: number | null;
  death_year?: number | null;
}

export function ArtistSidebar({
  id,
  name,
  bio,
  avatar_url,
  albumCount,
  yearStart,
  yearEnd,
  death_year,
}: ArtistSidebarProps) {
  const [avatarUrl, setAvatarUrl] = useState(avatar_url);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`/api/upload/artist/${id}?field=avatar`, {
        method: 'PATCH',
        body: form,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setAvatarUrl(url);
      toast.success('Photo de profil mise à jour.');
    } catch {
      toast.error('Erreur upload.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <aside className="w-full lg:w-[272px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.05] lg:sticky lg:top-14 lg:self-start lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
      <div className="px-7 py-8 flex flex-col gap-7">
        {/* Avatar */}
        <div
          className="group relative w-[128px] h-[128px] rounded-2xl overflow-hidden bg-[#1c1c1c] cursor-pointer shadow-2xl ring-1 ring-white/8"
          onClick={() => inputRef.current?.click()}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill sizes="128px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera size={30} className="text-white/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Camera size={16} className="text-white" />
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = '';
          }}
        />

        {/* Métadonnées */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-[#686868] text-xs">
            <Disc3 size={11} className="shrink-0" />
            <span>
              <span className="text-[#c8c8c8] font-medium">{albumCount}</span> albums
            </span>
          </div>

          {yearStart && yearEnd && (
            <div className="flex items-center gap-2.5 text-[#686868] text-xs">
              <CalendarDays size={11} className="shrink-0" />
              <span className="font-mono">
                {yearStart} – {yearEnd}
              </span>
            </div>
          )}

          {death_year && (
            <div className="flex items-center gap-2.5 text-xs" style={{ color: '#9a7d52' }}>
              <span className="text-sm leading-none shrink-0 font-serif">†</span>
              <span className="font-mono">{death_year}</span>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="h-px bg-white/[0.05]" />

        {/* Biographie */}
        {bio && (
          <p className="text-[#585858] text-[11.5px] leading-[1.8] tracking-wide">
            {bio}
          </p>
        )}
      </div>
    </aside>
  );
}
