'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search } from 'lucide-react';
import { useSearch } from '@/lib/search-context';

interface AlbumNavProps {
  artistName: string;
  artistSlug: string;
  albumTitle: string;
  heroHeight?: number;
}

export function AlbumNav({ artistName, artistSlug, albumTitle, heroHeight = 480 }: AlbumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const { open } = useSearch();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setShowTitle(y > heroHeight - 90);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroHeight]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(18,18,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-2 min-w-0">
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/" className="text-white/50 hover:text-white font-black text-base tracking-tight transition-colors shrink-0">
            afan
          </Link>
          <span className="text-white/15 shrink-0">/</span>
          <Link href={`/artist/${artistSlug}`} className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-sm shrink-0">
            <ChevronLeft size={14} />
            {artistName}
          </Link>

          {/* Titre album au scroll */}
          <div
            className="flex items-center gap-2 min-w-0 transition-all duration-300"
            style={{ opacity: showTitle ? 1 : 0, transform: `translateY(${showTitle ? 0 : -4}px)` }}
          >
            <span className="text-white/15 shrink-0">/</span>
            <span className="text-white/80 text-sm font-medium truncate">{albumTitle}</span>
          </div>
        </div>

        {/* Bouton recherche */}
        <button
          onClick={open}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all shrink-0"
        >
          <Search size={12} />
          <kbd className="hidden sm:inline font-mono text-[10px] text-white/20">⌘K</kbd>
        </button>
      </div>
    </nav>
  );
}
