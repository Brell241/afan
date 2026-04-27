import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; albumSlug: string }> }
) {
  const { slug, albumSlug } = await params;

  const [artist] = await db.select().from(artists).where(eq(artists.slug, slug));
  if (!artist) return NextResponse.json({ error: 'Artiste introuvable' }, { status: 404 });

  const [album] = await db
    .select()
    .from(albums)
    .where(and(eq(albums.artist_id, artist.id), eq(albums.slug, albumSlug)));

  if (!album) return NextResponse.json({ error: 'Album introuvable' }, { status: 404 });

  const albumTracks = await db
    .select()
    .from(tracks)
    .where(eq(tracks.album_id, album.id));

  return NextResponse.json({ artist, album, tracks: albumTracks });
}
