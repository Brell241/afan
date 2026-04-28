'use client';

import { useState } from 'react';
import { ContributionForm } from './ContributionForm';

interface ContributionSectionProps {
  albumId: string;
  hasLyrics: boolean;
}

export function ContributionSection({ albumId, hasLyrics }: ContributionSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-bold text-xl">Paroles & Sens</h2>
          <p className="text-[#B3B3B3] text-sm mt-0.5">Contribue à la mémoire collective</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2 rounded-full border border-white/30 hover:border-white text-white text-sm font-semibold transition-colors"
        >
          + Contribuer
        </button>
      </div>

      {!hasLyrics && (
        <div className="py-12 text-center rounded-lg border border-dashed border-white/10">
          <p className="text-[#B3B3B3] text-sm mb-3">Aucune parole pour cet album.</p>
          <button
            onClick={() => setOpen(true)}
            className="text-[#1DB954] text-sm hover:underline underline-offset-4"
          >
            Sois le premier à contribuer →
          </button>
        </div>
      )}

      <ContributionForm albumId={albumId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
