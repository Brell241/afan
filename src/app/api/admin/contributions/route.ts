import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { contributions, user } from '@/db/schema';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  return u?.role === 'admin' ? session : null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const status = req.nextUrl.searchParams.get('status') ?? 'pending';

  const rows = await db
    .select()
    .from(contributions)
    .where(eq(contributions.status, status as 'pending' | 'approved' | 'rejected'))
    .orderBy(desc(contributions.created_at));

  return NextResponse.json(rows);
}
