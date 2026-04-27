'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Track } from '@/db/schema';

interface TracklistProps {
  tracks: Track[];
}

export function Tracklist({ tracks }: TracklistProps) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  if (tracks.length === 0) {
    return (
      <div className="py-8 text-center text-white/30 text-sm">
        Aucun titre enregistré pour cet album. Tu peux contribuer ci-dessous.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-[#1a2e1a]">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-4 py-3 px-1 group hover:bg-[#1a2e1a]/40 rounded transition-colors"
          >
            <span className="text-[#2a4a2a] text-xs font-mono w-6 text-right shrink-0">
              {track.track_number ?? '—'}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-sm font-medium truncate">{track.title}</p>
              {track.duration && (
                <span className="text-[#4a7c59] text-xs">{track.duration}</span>
              )}
            </div>

            {track.youtube_url ? (
              <button
                onClick={() => setActiveUrl(track.youtube_url!)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a2e1a] border border-[#2a4a2a] text-[#a3c9a8] text-xs hover:border-[#4a7c59] hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                ▶ Écouter
              </button>
            ) : (
              <Badge
                variant="outline"
                className="border-[#1a2e1a] text-[#2a4a2a] text-xs opacity-0 group-hover:opacity-100 shrink-0"
              >
                Lien manquant
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Modal YouTube */}
      <Dialog open={!!activeUrl} onOpenChange={() => setActiveUrl(null)}>
        <DialogContent className="bg-[#0d1a0d] border-[#2a4a2a] max-w-2xl p-0 overflow-hidden">
          {activeUrl && (
            <iframe
              src={activeUrl.replace('watch?v=', 'embed/')}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
