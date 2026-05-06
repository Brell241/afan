import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { contributions, artists, albums, user } from '@/db/schema';
import { auth } from '@/lib/auth';

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id));
  return u?.role === 'admin' ? session : null;
}

function slugify(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const { id } = await params;
  const { action } = await req.json() as { action: 'approve' | 'reject' };

  const [contribution] = await db
    .select()
    .from(contributions)
    .where(eq(contributions.id, id));

  if (!contribution) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const now = new Date();

  if (action === 'approve') {
    // Créer l'artiste ou l'album si besoin
    if (contribution.type === 'add_artist' && contribution.extra) {
      const data = JSON.parse(contribution.extra) as {
        name: string; bio?: string; genre?: string; born_year?: number; death_year?: number;
      };
      const slug = slugify(data.name);
      await db.insert(artists).values({
        name: data.name,
        slug,
        bio: data.bio ?? null,
        born_year: data.born_year ?? null,
        death_year: data.death_year ?? null,
      });
    }

    if (contribution.type === 'add_album' && contribution.extra && contribution.artist_id) {
      const data = JSON.parse(contribution.extra) as {
        title: string; year: number; label?: string; format?: string; genre?: string; description?: string;
      };
      const slug = slugify(data.title);
      await db.insert(albums).values({
        artist_id: contribution.artist_id,
        title: data.title,
        slug,
        year: data.year,
        label: data.label ?? null,
        format: data.format ?? null,
        genre: data.genre ?? null,
        description: data.description ?? null,
      });
    }

    await db
      .update(contributions)
      .set({ status: 'approved', reviewed_at: now, reviewed_by: admin.user.id })
      .where(eq(contributions.id, id));
  } else {
    await db
      .update(contributions)
      .set({ status: 'rejected', reviewed_at: now, reviewed_by: admin.user.id })
      .where(eq(contributions.id, id));
  }

  return NextResponse.json({ success: true });
}
