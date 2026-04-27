import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contributions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const body = await req.json();

  const { type, content, file_url, track_id, album_id } = body;

  if (!type || !['lyrics', 'anecdote', 'link', 'media'].includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  }

  if (!content && !file_url) {
    return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });
  }

  await db.insert(contributions).values({
    type,
    content: content ?? null,
    file_url: file_url ?? null,
    track_id: track_id ?? null,
    album_id: album_id ?? null,
    user_id: session?.user?.id ?? null,
    status: 'pending',
  });

  return NextResponse.json({ success: true });
}
