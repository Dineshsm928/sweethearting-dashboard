import { NextResponse } from 'next/server';
import { gcs, BUCKET_NAME } from '@/lib/gcs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('file');
  const date = searchParams.get('date') || '2026-04-16';
  
  if (!filename) return new NextResponse('File missing', { status: 400 });
  
  try {
    const bucket = gcs.bucket(BUCKET_NAME);
    const file = bucket.file(`backfill_crops/${date}/${filename}`);
    
    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse(`File not found in GCS: ${filename}`, { status: 404 });
    }
    
    const [imageBuffer] = await file.download();
    
    return new NextResponse(imageBuffer as any, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Failed to load image from GCS', { status: 500 });
  }
}
