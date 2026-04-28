import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import { db } from '@/db';
import { albums } from '@/db/schema';

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
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'afan/albums', resource_type: 'image', transformation: [{ width: 800, height: 800, crop: 'fill' }] },
      (err, res) => (err ? reject(err) : resolve(res as { secure_url: string }))
    ).end(buffer);
  });

  await db.update(albums).set({ image_url: result.secure_url }).where(eq(albums.id, id));

  return NextResponse.json({ url: result.secure_url });
}
