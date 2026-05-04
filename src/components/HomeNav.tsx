'use client';

import Link from 'next/link';
import { Search, Library } from 'lucide-react';
import { useSearch } from '@/lib/search-context';
import { useSession } from '@/lib/auth-client';

export function HomeNav() {
  const { open } = useSearch();
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-white font-black text-xl tracking-tight">afan</span>

        <div className="flex items-center gap-3">
          <button
            onClick={open}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all"
          >
            <Search size={12} />
            <span className="hidden sm:inline">Rechercher…</span>
            <kbd className="hidden sm:inline font-mono text-[10px] text-white/20 border border-white/10 rounded px-1">⌘K</kbd>
          </button>

          {session?.user && (
            <Link
              href="/library"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all"
            >
              <Library size={12} />
              <span className="hidden sm:inline">Ma musique</span>
            </Link>
          )}
          <a
            href="#artistes"
            className="bg-white text-black text-xs font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-transform"
          >
            Explorer
          </a>
        </div>
      </div>
    </nav>
  );
}
