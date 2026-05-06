import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contributions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const VALID_TYPES = ['lyrics', 'anecdote', 'link', 'media', 'add_artist', 'add_album'] as const;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const body = await req.json() as {
    type: string; content?: string; file_url?: string;
    track_id?: string; album_id?: string; artist_id?: string; extra?: string;
  };

  const { type, content, file_url, track_id, album_id, artist_id, extra } = body;

  if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  }

  if (!content && !file_url && !extra) {
    return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });
  }

  await db.insert(contributions).values({
    type: type as typeof VALID_TYPES[number],
    content: content ?? null,
    file_url: file_url ?? null,
    track_id: track_id ?? null,
    album_id: album_id ?? null,
    artist_id: artist_id ?? null,
    extra: extra ?? null,
    user_id: session?.user?.id ?? null,
    status: 'pending',
  });

  return NextResponse.json({ success: true });
}
