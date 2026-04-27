'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

type ContributionType = 'lyrics' | 'anecdote' | 'link' | 'media';

interface ContributionFormProps {
  albumId: string;
  trackId?: string;
  open: boolean;
  onClose: () => void;
}

export function ContributionForm({ albumId, trackId, open, onClose }: ContributionFormProps) {
  const { data: session } = authClient.useSession();

  const [type, setType] = useState<ContributionType>('lyrics');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'auth' | 'sent'>('form');
  const [loading, setLoading] = useState(false);

  const typeLabels: Record<ContributionType, string> = {
    lyrics: 'Paroles',
    anecdote: 'Anecdote',
    link: 'Lien externe',
    media: 'Média (photo, document)',
  };

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error('Le contenu ne peut pas être vide.');
      return;
    }

    if (!session) {
      setStep('auth');
      return;
    }

    await sendContribution();
  }

  async function sendContribution() {
    setLoading(true);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, album_id: albumId, track_id: trackId ?? null }),
      });

      if (!res.ok) throw new Error('Erreur serveur');

      toast.success('Merci ! Ta contribution est en attente de validation.');
      setContent('');
      setStep('form');
      onClose();
    } catch {
      toast.error('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!email) return;
    setLoading(true);
    try {
      await authClient.signIn.magicLink({ email, callbackURL: window.location.href });
      setStep('sent');
    } catch {
      toast.error('Impossible d\'envoyer le lien magique.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1a0d] border-[#2a4a2a] text-white max-w-md">
        {step === 'form' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Contribuer</h2>
              <p className="text-white/50 text-sm mt-1">
                Partage tes connaissances sur cette œuvre du patrimoine gabonais.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white/70">Type de contribution</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContributionType)}>
                <SelectTrigger className="bg-[#1a2e1a] border-[#2a4a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2e1a] border-[#2a4a2a]">
                  {Object.entries(typeLabels).map(([v, label]) => (
                    <SelectItem key={v} value={v} className="text-white hover:bg-[#2a4a2a]">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white/70">
                {type === 'link' ? 'URL' : 'Contenu'}
              </Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === 'lyrics' ? 'Colle ou écris les paroles ici...' :
                  type === 'anecdote' ? 'Partage une anecdote, un souvenir...' :
                  type === 'link' ? 'https://...' :
                  'Description du média...'
                }
                rows={6}
                className="bg-[#1a2e1a] border-[#2a4a2a] text-white placeholder:text-white/20 resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="bg-[#4a7c59] hover:bg-[#5a8c69] text-white"
            >
              {session ? 'Soumettre' : 'Continuer →'}
            </Button>
          </div>
        )}

        {step === 'auth' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Confirme ton identité</h2>
              <p className="text-white/50 text-sm mt-1">
                Un lien magique sera envoyé à ton adresse pour valider ta contribution.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white/70">Adresse e-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="bg-[#1a2e1a] border-[#2a4a2a] text-white placeholder:text-white/20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep('form')}
                className="text-white/50 hover:text-white flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={sendMagicLink}
                disabled={loading}
                className="bg-[#4a7c59] hover:bg-[#5a8c69] text-white flex-1"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="text-4xl">🌿</span>
            <h2 className="text-xl font-serif font-bold text-white">Lien envoyé !</h2>
            <p className="text-white/50 text-sm">
              Vérifie ta boîte mail. Après confirmation, ta contribution sera soumise automatiquement.
            </p>
            <Button variant="ghost" onClick={onClose} className="text-white/50 hover:text-white mt-2">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
