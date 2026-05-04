import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { playlists, playlist_tracks } from '@/db/schema';
import { auth } from '@/lib/auth';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const isUuid = UUID_RE.test(id);
  const [playlist] = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(
      and(
        eq(playlists.user_id, session.user.id),
        isUuid ? eq(playlists.id, id) : eq(playlists.short_id, id)
      )
    );

  if (!playlist) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const { trackIds } = await req.json() as { trackIds: string[] };
  if (!Array.isArray(trackIds)) return NextResponse.json({ error: 'trackIds requis' }, { status: 400 });

  await Promise.all(
    trackIds.map((trackId, position) =>
      db
        .update(playlist_tracks)
        .set({ position })
        .where(
          and(
            eq(playlist_tracks.playlist_id, playlist.id),
            eq(playlist_tracks.track_id, trackId)
          )
        )
    )
  );

  return NextResponse.json({ success: true });
}
