'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search } from 'lucide-react';
import { useSearch } from '@/lib/search-context';

interface ArtistNavProps {
  name: string;
  heroHeight?: number;
}

export function ArtistNav({ name, heroHeight = 520 }: ArtistNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showName, setShowName] = useState(false);
  const { open } = useSearch();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      setShowName(y > heroHeight - 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroHeight]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="text-white/70 hover:text-white font-black text-base tracking-tight transition-colors">
            afan
          </Link>
          <span className="text-white/15">/</span>
          <Link href="/#artistes" className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-sm">
            <ChevronLeft size={14} />
            Artistes
          </Link>
        </div>

        {/* Nom au scroll — centré */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none"
          style={{ opacity: showName ? 1 : 0, transform: `translateX(-50%) translateY(${showName ? 0 : -6}px)` }}
        >
          <span className="text-white/90 text-sm font-semibold tracking-wide">{name}</span>
        </div>

        {/* Bouton recherche */}
        <button
          onClick={open}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all"
        >
          <Search size={12} />
          <kbd className="hidden sm:inline font-mono text-[10px] text-white/20">⌘K</kbd>
        </button>
      </div>
    </nav>
  );
}
