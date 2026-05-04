import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { playlists, playlist_tracks } from '@/db/schema';
import { auth } from '@/lib/auth';

async function ownsPlaylist(userId: string, playlistId: string) {
  const [p] = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.user_id, userId)));
  return !!p;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  if (!(await ownsPlaylist(session.user.id, id))) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }

  const { trackId } = await req.json() as { trackId: string };
  await db
    .insert(playlist_tracks)
    .values({ playlist_id: id, track_id: trackId, position: 0 })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  if (!(await ownsPlaylist(session.user.id, id))) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }

  const { trackId } = await req.json() as { trackId: string };
  await db
    .delete(playlist_tracks)
    .where(and(eq(playlist_tracks.playlist_id, id), eq(playlist_tracks.track_id, trackId)));

  return NextResponse.json({ success: true });
}
