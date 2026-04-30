'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SearchCtx { isOpen: boolean; open: () => void; close: () => void }
const Ctx = createContext<SearchCtx>({ isOpen: false, open: () => {}, close: () => {} });

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen((v) => !v); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <Ctx.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSearch = () => useContext(Ctx);
