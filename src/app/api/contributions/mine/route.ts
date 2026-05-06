import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '@/db';
import { contributions } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const userId = session.user.id;

  const rows = await db
    .select()
    .from(contributions)
    .where(eq(contributions.user_id, userId))
    .orderBy(desc(contributions.created_at));

  const [{ approved }] = await db
    .select({ approved: count() })
    .from(contributions)
    .where(and(eq(contributions.user_id, userId), eq(contributions.status, 'approved')));

  return NextResponse.json({ contributions: rows, approvedCount: Number(approved) });
}
