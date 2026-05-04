'use client';

import { useState } from 'react';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useLibrary } from '@/lib/library-context';

export function AuthModal() {
  const { authModalOpen, closeAuthModal } = useLibrary();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  if (!authModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await authClient.signIn.magicLink({ email: email.trim(), callbackURL: window.location.pathname });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  function handleClose() {
    closeAuthModal();
    setEmail('');
    setStatus('idle');
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-2xl border border-white/[0.08] shadow-2xl p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
        >
          <X size={16} />
        </button>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 size={40} className="text-[#1DB954]" />
            <div>
              <p className="text-white font-semibold">Lien envoyé !</p>
              <p className="text-white/45 text-sm mt-1">Vérifie ta boîte mail pour te connecter.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Connexion</p>
              <h2 className="text-white font-bold text-lg leading-tight">
                Sauvegarde ta musique
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Connecte-toi pour aimer des titres et créer des playlists.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {status === 'error' && (
                <p className="text-red-400/80 text-xs">Une erreur est survenue, réessaie.</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <Loader2 size={15} className="animate-spin mx-auto" />
                ) : (
                  'Envoyer le lien magique'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
