import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '@/db';
import { artists } from '@/db/schema';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const field = req.nextUrl.searchParams.get('field') === 'avatar' ? 'avatar_url' : 'photo_url';

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `afan/artists/${field === 'avatar_url' ? 'avatars' : 'covers'}`, resource_type: 'image', transformation: [{ width: 1200, crop: 'limit' }] },
      (err, res) => (err ? reject(err) : resolve(res as { secure_url: string }))
    ).end(buffer);
  });

  const updateData = field === 'avatar_url'
    ? { avatar_url: result.secure_url }
    : { photo_url: result.secure_url };

  await db.update(artists).set(updateData).where(eq(artists.id, id));

  return NextResponse.json({ url: result.secure_url });
}
