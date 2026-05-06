export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { contributions, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { AdminContributions } from '@/components/admin/AdminContributions';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  if (u?.role !== 'admin') redirect('/');

  const pending = await db
    .select()
    .from(contributions)
    .where(eq(contributions.status, 'pending'))
    .orderBy(desc(contributions.created_at));

  return (
    <main className="min-h-screen bg-[#0c0c0c] pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="mb-8">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Administration</p>
          <h1 className="text-white font-black text-3xl tracking-tight">Contributions</h1>
          <p className="text-white/40 text-sm mt-1">
            {pending.length} demande{pending.length !== 1 ? 's' : ''} en attente
          </p>
        </div>

        <AdminContributions contributions={pending} />
      </div>
    </main>
  );
}
