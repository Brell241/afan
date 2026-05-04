import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { playlists, playlist_tracks, tracks, albums, artists } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, id), eq(playlists.user_id, session.user.id)));

  if (!playlist) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const entries = await db
    .select({ track: tracks, album: albums, artist: { name: artists.name, slug: artists.slug } })
    .from(playlist_tracks)
    .innerJoin(tracks, eq(playlist_tracks.track_id, tracks.id))
    .innerJoin(albums, eq(tracks.album_id, albums.id))
    .innerJoin(artists, eq(albums.artist_id, artists.id))
    .where(eq(playlist_tracks.playlist_id, id))
    .orderBy(playlist_tracks.position, playlist_tracks.added_at);

  return NextResponse.json({ playlist, entries });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;
  await db
    .delete(playlists)
    .where(and(eq(playlists.id, id), eq(playlists.user_id, session.user.id)));

  return NextResponse.json({ success: true });
}
