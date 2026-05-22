import { NextResponse } from 'next/server';
import { gcs, BUCKET_NAME } from '@/lib/gcs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || '2026-04-16';
    
    const bucket = gcs.bucket(BUCKET_NAME);
    const file = bucket.file(`backfill_crops/${date}/pending_approvals_${date}.json`);
    
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ items: [] });
    }
    
    const [contents] = await file.download();
    const rawItems = JSON.parse(contents.toString('utf-8'));
    
    // Filter only pending items
    const items = rawItems.filter((item: any) => item.status === 'pending' || !item.status);
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read pending items from GCS' }, { status: 500 });
  }
}
