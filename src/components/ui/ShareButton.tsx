'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  className?: string;
  iconOnly?: boolean;
}

export function ShareButton({ url, title, text, className, iconOnly = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const fullUrl = `${window.location.origin}${url}`;
    const shareData: ShareData = { url: fullUrl, title, ...(text ? { text } : {}) };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') toast.error('Erreur de partage.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success('Lien copié !');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Impossible de copier le lien.');
      }
    }
  }

  return (
    <button onClick={handleShare} aria-label="Partager" className={className}>
      {copied ? <Check size={11} /> : <Share2 size={11} />}
      {!iconOnly && 'Partager'}
    </button>
  );
}
