import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { playlists, playlist_tracks } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json([]);

  const userId = session.user.id;
  const rows = await db
    .select({
      id: playlists.id,
      name: playlists.name,
      created_at: playlists.created_at,
      trackCount: sql<number>`count(${playlist_tracks.id})::int`,
    })
    .from(playlists)
    .leftJoin(playlist_tracks, eq(playlist_tracks.playlist_id, playlists.id))
    .where(eq(playlists.user_id, userId))
    .groupBy(playlists.id)
    .orderBy(playlists.created_at);

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { name } = await req.json() as { name: string };
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const [playlist] = await db
    .insert(playlists)
    .values({ user_id: session.user.id, name: name.trim() })
    .returning();

  return NextResponse.json(playlist);
}
