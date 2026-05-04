import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { likes, tracks, albums, artists } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ tracks: [] });

  const rows = await db
    .select({ track: tracks, album: albums, artist: { name: artists.name, slug: artists.slug } })
    .from(likes)
    .innerJoin(tracks, eq(likes.track_id, tracks.id))
    .innerJoin(albums, eq(tracks.album_id, albums.id))
    .innerJoin(artists, eq(albums.artist_id, artists.id))
    .where(eq(likes.user_id, session.user.id))
    .orderBy(likes.created_at);

  return NextResponse.json({ tracks: rows });
}
