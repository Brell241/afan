'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, User, Disc3, FileText, Link2, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Contribution } from '@/db/schema';

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  lyrics:     { label: 'Paroles',     icon: <FileText size={13} /> },
  anecdote:   { label: 'Anecdote',    icon: <FileText size={13} /> },
  link:       { label: 'Lien',        icon: <Link2 size={13} /> },
  media:      { label: 'Média',       icon: <ImageIcon size={13} /> },
  add_artist: { label: 'Nouvel artiste', icon: <User size={13} /> },
  add_album:  { label: 'Nouvel album',   icon: <Disc3 size={13} /> },
};

function ContributionCard({ contribution, onAction }: {
  contribution: Contribution;
  onAction: (id: string, action: 'approve' | 'reject') => Promise<void>;
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [expanded, setExpanded] = useState(false);

  const meta = TYPE_LABELS[contribution.type] ?? { label: contribution.type, icon: <FileText size={13} /> };
  const extra = contribution.extra ? JSON.parse(contribution.extra) as Record<string, unknown> : null;
  const isRequest = contribution.type === 'add_artist' || contribution.type === 'add_album';

  async function handle(action: 'approve' | 'reject') {
    setLoading(action);
    try {
      await onAction(contribution.id, action);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {/* Type badge */}
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 mt-0.5 ${
          isRequest ? 'bg-[#e85d7e]/15 text-[#e85d7e]' : 'bg-white/[0.08] text-white/50'
        }`}>
          {meta.icon} {meta.label}
        </span>

        <div className="flex-1 min-w-0">
          {/* Titre ou contenu */}
          {extra ? (
            <p className="text-white text-sm font-medium truncate">
              {String(extra.name ?? extra.title ?? contribution.content ?? '—')}
            </p>
          ) : (
            <p className="text-white/70 text-sm line-clamp-2">{contribution.content ?? '—'}</p>
          )}
          <p className="text-white/25 text-[11px] mt-0.5">
            {contribution.user_id ? `user:${contribution.user_id.slice(0, 8)}…` : 'Anonyme'}
            {' · '}
            {new Date(contribution.created_at!).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Expand */}
        {(extra || contribution.content) && (
          <button onClick={() => setExpanded(!expanded)} className="text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Détails expandables */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.05] pt-3">
          {extra ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(extra).map(([k, v]) => v != null && (
                <div key={k} className="flex gap-2">
                  <span className="text-white/30 capitalize">{k.replace(/_/g, ' ')} :</span>
                  <span className="text-white/70">{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm whitespace-pre-wrap">{contribution.content}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => handle('approve')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] text-xs font-semibold hover:bg-[#1DB954]/25 transition-all disabled:opacity-50"
        >
          <CheckCircle2 size={13} />
          {loading === 'approve' ? 'En cours…' : 'Approuver'}
        </button>
        <button
          onClick={() => handle('reject')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
        >
          <XCircle size={13} />
          {loading === 'reject' ? 'En cours…' : 'Rejeter'}
        </button>
      </div>
    </div>
  );
}

export function AdminContributions({ contributions }: { contributions: Contribution[] }) {
  const router = useRouter();
  const [items, setItems] = useState(contributions);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const res = await fetch(`/api/admin/contributions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      toast.error('Erreur lors de la mise à jour.');
      return;
    }

    toast.success(action === 'approve' ? 'Contribution approuvée !' : 'Contribution rejetée.');
    setItems((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  const requests = items.filter((c) => c.type === 'add_artist' || c.type === 'add_album');
  const content = items.filter((c) => c.type !== 'add_artist' && c.type !== 'add_album');

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-white/25 text-sm">
        Aucune contribution en attente — tout est à jour.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {requests.length > 0 && (
        <section>
          <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
            Ajouts demandés ({requests.length})
          </h2>
          <div className="flex flex-col gap-3">
            {requests.map((c) => (
              <ContributionCard key={c.id} contribution={c} onAction={handleAction} />
            ))}
          </div>
        </section>
      )}

      {content.length > 0 && (
        <section>
          <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
            Contributions de contenu ({content.length})
          </h2>
          <div className="flex flex-col gap-3">
            {content.map((c) => (
              <ContributionCard key={c.id} contribution={c} onAction={handleAction} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
