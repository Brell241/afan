'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLibrary } from '@/lib/library-context';

interface LikeButtonProps {
  type: 'track' | 'album' | 'artist';
  id: string;
  className?: string;
  size?: number;
  count?: number;
  showCount?: boolean;
}

export function LikeButton({ type, id, className, size = 15, count, showCount }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLibrary();
  const liked = isLiked(type, id);
  const [localCount, setLocalCount] = useState(count ?? 0);

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const wasLiked = liked;
    setLocalCount((n) => (wasLiked ? Math.max(0, n - 1) : n + 1));
    await toggleLike(type, id);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      data-liked={liked ? 'true' : undefined}
      className={className}
    >
      <Heart
        size={size}
        className={liked ? 'text-[#e85d7e]' : 'text-current'}
        fill={liked ? 'currentColor' : 'none'}
      />
      {showCount && localCount > 0 && (
        <span className="text-[10px] font-medium tabular-nums leading-none ml-1">
          {localCount}
        </span>
      )}
    </button>
  );
}
