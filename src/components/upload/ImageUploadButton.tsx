'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadButtonProps {
  endpoint: string;
  onSuccess: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUploadButton({ endpoint, onSuccess, label = 'Changer la photo', className }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(endpoint, { method: 'PATCH', body: form });
      if (!res.ok) throw new Error('Upload échoué');
      const { url } = await res.json();
      onSuccess(url);
      toast.success('Image mise à jour.');
    } catch {
      toast.error('Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={className ?? 'flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium backdrop-blur transition-all disabled:opacity-50'}
      >
        {uploading ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Upload...
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {label}
          </>
        )}
      </button>
    </>
  );
}
