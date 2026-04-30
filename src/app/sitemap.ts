import { MetadataRoute } from 'next';
import { db } from '@/db';
import { artists, albums } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://afan.atekbot.space';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
  ];

  if (!process.env.DATABASE_URL) return staticRoutes;

  try {
    const allArtists = await db.select({ slug: artists.slug }).from(artists);

    const allAlbums = await db
      .select({ slug: albums.slug, artistSlug: artists.slug })
      .from(albums)
      .innerJoin(artists, eq(albums.artist_id, artists.id));

    const artistRoutes: MetadataRoute.Sitemap = allArtists.map(({ slug }) => ({
      url: `${BASE_URL}/artist/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    const albumRoutes: MetadataRoute.Sitemap = allAlbums.map(({ slug, artistSlug }) => ({
      url: `${BASE_URL}/artist/${artistSlug}/album/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...artistRoutes, ...albumRoutes];
  } catch {
    return staticRoutes;
  }
}
