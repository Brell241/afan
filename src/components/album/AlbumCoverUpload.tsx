'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

interface AlbumCoverUploadProps {
  albumId: string;
  imageUrl: string | null;
}

export function AlbumCoverUpload({ albumId, imageUrl }: AlbumCoverUploadProps) {
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    } catch {
      toast.error('Erreur upload.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <div
        className="relative group w-36 h-36 sm:w-44 sm:h-44 shrink-0 shadow-2xl rounded-sm overflow-hidden bg-[#282828] cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <Image src={currentUrl} alt="Pochette" fill sizes="(max-width:640px) 144px, 176px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-end p-4 bg-gradient-to-br from-[#444] to-[#1a1a1a]">
            <Camera size={32} className="text-white/15" />
          </div>
        )}

        {/* Overlay upload */}
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <span className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <>
                <Camera size={24} className="text-white" />
                <span className="text-white text-xs font-medium">Changer la pochette</span>
              </>
          }
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
      />
    </>
  );
}
