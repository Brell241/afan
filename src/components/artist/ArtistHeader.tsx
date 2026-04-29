'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ArtistHeaderProps {
  id: string;
  name: string;
  photo_url: string | null;
}

export function ArtistHeader({ id, name, photo_url }: ArtistHeaderProps) {
  const [coverUrl, setCoverUrl] = useState(photo_url);
  const [uploading, setUploading] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (rect.bottom < 0) return;
      setParallaxY(window.scrollY * 0.35);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function upload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`/api/upload/artist/${id}`, { method: 'PATCH', body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setCoverUrl(url);
      toast.success('Photo de couverture mise à jour.');
    } catch {
      toast.error('Erreur upload.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div ref={heroRef} className="relative w-full overflow-hidden" style={{ height: 460 }}>
      {/* Background avec parallax */}
      <div
        className="absolute inset-x-0"
        style={{
          top: -80,
          bottom: -80,
          transform: `translateY(${parallaxY}px)`,
          willChange: 'transform',
        }}
      >
        {coverUrl ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              filter: 'brightness(0.38) saturate(0.8)',
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2c2416] via-[#181410] to-[#0a0a0a]" />
        )}
      </div>

      {/* Dégradé principal bas */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
      {/* Vignette gauche */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/65 via-transparent to-transparent" />

      {/* Nom de l'artiste — parallax propre (monte moins vite que le fond) */}
      <div
        className="absolute bottom-12 left-8 z-10 select-none"
        style={{
          transform: `translateY(${parallaxY * 0.18}px)`,
          willChange: 'transform',
        }}
      >
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
          Artiste
        </p>
        <h1
          className="font-black text-white leading-[0.88] tracking-tighter"
          style={{ fontSize: 'clamp(3.5rem, 8.5vw, 7.5rem)' }}
        >
          {name}
        </h1>
      </div>

      {/* Bouton upload couverture */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 hover:bg-black/85 border border-white/10 text-white/50 hover:text-white/80 text-xs backdrop-blur transition-all duration-200"
      >
        {uploading ? (
          <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        ) : (
          <ImageIcon size={11} />
        )}
        Couverture
      </button>

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
    </div>
  );
}
