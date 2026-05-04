import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { likes } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ trackIds: [], albumIds: [], artistIds: [] });

  const userId = session.user.id;
  const rows = await db.select().from(likes).where(eq(likes.user_id, userId));

  return NextResponse.json({
    trackIds: rows.filter((r) => r.track_id).map((r) => r.track_id!),
    albumIds: rows.filter((r) => r.album_id).map((r) => r.album_id!),
    artistIds: rows.filter((r) => r.artist_id).map((r) => r.artist_id!),
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const userId = session.user.id;
  const { type, id } = await req.json() as { type: 'track' | 'album' | 'artist'; id: string };

  const field = type === 'track' ? likes.track_id : type === 'album' ? likes.album_id : likes.artist_id;

  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.user_id, userId), eq(field, id)));

  if (existing) {
    await db.delete(likes).where(eq(likes.id, existing.id));
    return NextResponse.json({ liked: false });
  }

  await db.insert(likes).values({
    user_id: userId,
    track_id: type === 'track' ? id : null,
    album_id: type === 'album' ? id : null,
    artist_id: type === 'artist' ? id : null,
  });
  return NextResponse.json({ liked: true });
}
