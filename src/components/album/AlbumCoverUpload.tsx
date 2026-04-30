'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AlbumCoverUploadProps {
  albumId: string;
  imageUrl: string | null;
}

export function AlbumCoverUpload({ albumId, imageUrl }: AlbumCoverUploadProps) {
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const inputId = `cover-upload-${albumId}`;

  async function handleUpload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`/api/upload/album/${albumId}`, { method: 'PATCH', body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setCurrentUrl(url);
      toast.success('Pochette mise à jour.');
      router.refresh();
    } catch {
      toast.error('Erreur upload.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Zone image cliquable via label */}
      <label
        htmlFor={inputId}
        className="relative group w-36 h-36 sm:w-44 sm:h-44 shrink-0 shadow-2xl rounded-sm overflow-hidden bg-[#282828] cursor-pointer block"
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt="Pochette"
            fill
            sizes="(max-width:640px) 144px, 176px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-end p-4 bg-gradient-to-br from-[#444] to-[#1a1a1a]">
            <Camera size={32} className="text-white/15" />
          </div>
        )}

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <span className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <Camera size={24} className="text-white" />
              <span className="text-white text-xs font-medium text-center px-2">Changer la pochette</span>
            </>
          )}
        </div>
      </label>

      {/* Bouton explicite sous la pochette */}
      <label
        htmlFor={inputId}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all select-none
          ${uploading
            ? 'bg-white/5 text-white/30 pointer-events-none'
            : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white'
          }`}
      >
        {uploading ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            Upload en cours…
          </>
        ) : (
          <>
            <Upload size={11} />
            Changer la pochette
          </>
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
