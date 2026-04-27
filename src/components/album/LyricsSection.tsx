'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Track } from '@/db/schema';

interface LyricsSectionProps {
  track: Track;
  onContribute: () => void;
}

export function LyricsSection({ track, onContribute }: LyricsSectionProps) {
  const hasFr = !!track.lyrics_fr;
  const hasOriginal = !!track.lyrics_original;

  if (!hasFr && !hasOriginal) {
    return (
      <div className="py-6 text-center rounded-lg border border-dashed border-[#2a4a2a]">
        <p className="text-white/30 text-sm mb-3">Aucune parole pour ce titre.</p>
        <button
          onClick={onContribute}
          className="text-[#4a7c59] text-sm hover:text-[#a3c9a8] underline underline-offset-4 transition-colors"
        >
          Contribuer les paroles →
        </button>
      </div>
    );
  }

  return (
    <Tabs defaultValue={hasFr ? 'fr' : 'original'} className="w-full">
      <TabsList className="bg-[#1a2e1a] border border-[#2a4a2a] mb-4">
        {hasFr && (
          <TabsTrigger value="fr" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-[#2a4a2a]">
            Français
          </TabsTrigger>
        )}
        {hasOriginal && (
          <TabsTrigger value="original" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-[#2a4a2a]">
            Fang
          </TabsTrigger>
        )}
      </TabsList>

      {hasFr && (
        <TabsContent value="fr">
          <pre className="text-white/70 text-sm leading-8 whitespace-pre-wrap font-serif">
            {track.lyrics_fr}
          </pre>
        </TabsContent>
      )}
      {hasOriginal && (
        <TabsContent value="original">
          <pre className="text-white/70 text-sm leading-8 whitespace-pre-wrap font-serif">
            {track.lyrics_original}
          </pre>
        </TabsContent>
      )}
    </Tabs>
  );
}
