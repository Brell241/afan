import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { plays } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const { trackId } = await req.json() as { trackId: string };
  if (!trackId) return NextResponse.json({ error: 'trackId requis' }, { status: 400 });

  const session = await auth.api.getSession({ headers: await headers() });

  try {
    await db.insert(plays).values({
      track_id: trackId,
      user_id: session?.user?.id ?? null,
    });
  } catch {
    // ignorer les erreurs (track supprimé, etc.)
  }

  return NextResponse.json({ ok: true });
}
