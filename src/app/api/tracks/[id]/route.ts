import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { tracks } from '@/db/schema';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const update: Partial<{ context: string | null; lyrics_fr: string | null; lyrics_original: string | null }> = {};
  if ('context' in body) update.context = body.context ?? null;
  if ('lyrics_fr' in body) update.lyrics_fr = body.lyrics_fr ?? null;
  if ('lyrics_original' in body) update.lyrics_original = body.lyrics_original ?? null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  await db.update(tracks).set(update).where(eq(tracks.id, id));
  return NextResponse.json({ success: true });
}
