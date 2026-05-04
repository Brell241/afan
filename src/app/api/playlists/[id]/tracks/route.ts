import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { playlists, playlist_tracks } from '@/db/schema';
import { auth } from '@/lib/auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolvePlaylistUuid(userId: string, id: string): Promise<string | null> {
  const isUuid = UUID_RE.test(id);
  const [p] = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(
      and(
        eq(playlists.user_id, userId),
        isUuid ? eq(playlists.id, id) : eq(playlists.short_id, id)
      )
    );
  return p?.id ?? null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const uuid = await resolvePlaylistUuid(session.user.id, id);
  if (!uuid) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const { trackId } = await req.json() as { trackId: string };
  await db
    .insert(playlist_tracks)
    .values({ playlist_id: uuid, track_id: trackId, position: 0 })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const uuid = await resolvePlaylistUuid(session.user.id, id);
  if (!uuid) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const { trackId } = await req.json() as { trackId: string };
  await db
    .delete(playlist_tracks)
    .where(and(eq(playlist_tracks.playlist_id, uuid), eq(playlist_tracks.track_id, trackId)));

  return NextResponse.json({ success: true });
}
