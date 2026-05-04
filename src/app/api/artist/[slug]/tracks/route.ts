import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [artist] = await db.select().from(artists).where(eq(artists.slug, slug));
  if (!artist) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = await db
    .select({ track: tracks, album: albums })
    .from(tracks)
    .innerJoin(albums, eq(tracks.album_id, albums.id))
    .where(eq(albums.artist_id, artist.id))
    .orderBy(albums.year, tracks.track_number);

  return NextResponse.json({
    entries: rows,
    artist: { name: artist.name, slug: artist.slug },
  });
}
