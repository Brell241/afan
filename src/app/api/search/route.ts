import { NextRequest, NextResponse } from 'next/server';
import { or, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { artists, albums, tracks } from '@/db/schema';

export const dynamic = 'force-dynamic';

// Seuil de similarité pour les fautes de frappe (pg_trgm)
const FUZZY_THRESHOLD = 0.25;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ artists: [], albums: [], tracks: [] });

  const pattern = `%${q}%`;
  const year = parseInt(q, 10);
  const isYear = !isNaN(year) && q.length === 4;

  // Fallback: recherche simple sans unaccent (plus fiable)
  const artistMatch = sql`
    ${artists.name} ILIKE ${pattern}
  `;
  const albumTitleMatch = sql`
    ${albums.title} ILIKE ${pattern}
  `;
  const albumMetaMatch = sql`
    ${albums.genre} ILIKE ${pattern}
    OR ${albums.label} ILIKE ${pattern}
  `;
  const trackMatch = sql`
    ${tracks.title} ILIKE ${pattern}
  `;

  const [artistRows, albumRows, trackRows] = await Promise.all([
    db
      .select({ id: artists.id, name: artists.name, slug: artists.slug, avatar_url: artists.avatar_url, photo_url: artists.photo_url })
      .from(artists)
      .where(artistMatch)
      .limit(5),

    db
      .select({
        id: albums.id,
        title: albums.title,
        slug: albums.slug,
        year: albums.year,
        format: albums.format,
        image_url: albums.image_url,
        artist_id: albums.artist_id,
      })
      .from(albums)
      .where(
        isYear
          ? eq(albums.year, year)
          : or(albumTitleMatch, albumMetaMatch)
      )
      .limit(8),

    db
      .select({ id: tracks.id, title: tracks.title, youtube_url: tracks.youtube_url, album_id: tracks.album_id })
      .from(tracks)
      .where(trackMatch)
      .limit(8),
  ]);

  // Enrichir les albums avec le nom de l'artiste
  const artistIds = [...new Set(albumRows.map((a) => a.artist_id).filter(Boolean))] as string[];
  const artistMap: Record<string, { name: string; slug: string }> = {};
  if (artistIds.length) {
    const artistData = await db
      .select({ id: artists.id, name: artists.name, slug: artists.slug })
      .from(artists)
      .where(sql`${artists.id} = ANY(ARRAY[${sql.join(artistIds.map((id) => sql`${id}::uuid`), sql`, `)}])`);
    for (const a of artistData) artistMap[a.id] = { name: a.name, slug: a.slug };
  }

  // Enrichir les tracks avec album + artiste
  const albumIds = [...new Set(trackRows.map((t) => t.album_id).filter(Boolean))] as string[];
  const albumMap: Record<string, { slug: string; title: string; artist: { name: string; slug: string } }> = {};
  if (albumIds.length) {
    const albumData = await db
      .select({ id: albums.id, slug: albums.slug, title: albums.title, artist_id: albums.artist_id })
      .from(albums)
      .where(sql`${albums.id} = ANY(ARRAY[${sql.join(albumIds.map((id) => sql`${id}::uuid`), sql`, `)}])`);
    for (const alb of albumData) {
      const artist = alb.artist_id ? artistMap[alb.artist_id] ?? null : null;
      if (artist) albumMap[alb.id] = { slug: alb.slug, title: alb.title, artist };
    }
  }

  return NextResponse.json({
    artists: artistRows,
    albums: albumRows.map((a) => ({
      ...a,
      artist: a.artist_id ? artistMap[a.artist_id] ?? null : null,
    })),
    tracks: trackRows
      .filter((t) => t.album_id && albumMap[t.album_id])
      .map((t) => ({ ...t, album: albumMap[t.album_id!] })),
  });
}
