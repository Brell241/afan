'use client';

import { Heart } from 'lucide-react';
import { useLibrary } from '@/lib/library-context';

interface LikeButtonProps {
  type: 'track' | 'album' | 'artist';
  id: string;
  className?: string;
  size?: number;
}

export function LikeButton({ type, id, className, size = 15 }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLibrary();
  const liked = isLiked(type, id);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggleLike(type, id); }}
      aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      data-liked={liked ? 'true' : undefined}
      className={className}
    >
      <Heart
        size={size}
        className={liked ? 'text-[#e85d7e]' : 'text-current'}
        fill={liked ? 'currentColor' : 'none'}
      />
    </button>
  );
}
