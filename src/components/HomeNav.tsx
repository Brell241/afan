'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Library, Home, LogIn, LogOut, ShieldCheck, PlusCircle } from 'lucide-react';
import { useSearch } from '@/lib/search-context';
import { useSession, signOut } from '@/lib/auth-client';
import { useLibrary } from '@/lib/library-context';
import { usePathname } from 'next/navigation';
import { AddRequestModal } from '@/components/ui/AddRequestModal';

export function HomeNav() {
  const { open } = useSearch();
  const { data: session } = useSession();
  const { showAuthModal } = useLibrary();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <>
    <AddRequestModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-white font-black text-xl tracking-tight hover:text-white/80 transition-colors">
          afan
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={open}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all"
          >
            <Search size={12} />
            <span className="hidden sm:inline">Rechercher…</span>
            <kbd className="hidden sm:inline font-mono text-[10px] text-white/20 border border-white/10 rounded px-1">⌘K</kbd>
          </button>

          {session?.user && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs transition-all"
            >
              <PlusCircle size={12} />
              <span className="hidden sm:inline">Proposer</span>
            </button>
          )}

          {session?.user ? (
            <>
              <Link
                href="/library"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                  pathname.startsWith('/library')
                    ? 'bg-white/[0.10] border-white/[0.15] text-white/80'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-white/40 hover:text-white/70'
                }`}
              >
                <Library size={12} />
                <span className="hidden sm:inline">Ma musique</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-[#e85d7e]/20 border-[#e85d7e]/40 text-[#e85d7e]'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-white/40 hover:text-white/70'
                  }`}
                >
                  <ShieldCheck size={12} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/30 hover:text-white/60 text-xs transition-all"
                title="Se déconnecter"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline truncate max-w-[80px]">{session.user.name || session.user.email.split('@')[0]}</span>
              </button>
            </>
          ) : (
            <button
              onClick={showAuthModal}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 active:scale-95 transition-all"
            >
              <LogIn size={12} />
              <span>Se connecter</span>
            </button>
          )}

          {isHome ? (
            <a
              href="#artistes"
              className="bg-white/[0.08] text-white/70 text-xs font-bold px-4 py-2 rounded-full hover:bg-white/[0.15] transition-all hidden sm:flex"
            >
              Explorer
            </a>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 bg-white/[0.08] text-white/70 text-xs font-bold px-4 py-2 rounded-full hover:bg-white/[0.15] transition-all"
            >
              <Home size={12} />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
    </>
  );
}
