'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ArtistNavProps {
  name: string;
  heroHeight?: number;
}

export function ArtistNav({ name, heroHeight = 520 }: ArtistNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showName, setShowName] = useState(false);

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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
      }}
    >
      <div className="px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/45 hover:text-white/85 transition-colors text-sm"
        >
          <ChevronLeft size={15} />
          Retour
        </Link>

        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-300"
          style={{
            opacity: showName ? 1 : 0,
            transform: `translateX(-50%) translateY(${showName ? 0 : -6}px)`,
          }}
        >
          <span className="text-white/90 text-sm font-semibold tracking-wide">{name}</span>
        </div>
      </div>
    </nav>
  );
}
