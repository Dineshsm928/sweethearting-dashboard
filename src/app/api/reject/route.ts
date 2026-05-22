import { NextResponse } from 'next/server';
import { gcs, BUCKET_NAME } from '@/lib/gcs';

export async function POST(req: Request) {
  try {
    const { id, date = '2026-04-16' } = await req.json();
    if (id === undefined || id === null) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const bucket = gcs.bucket(BUCKET_NAME);
    const file = bucket.file(`backfill_crops/${date}/pending_approvals_${date}.json`);
    
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Approvals file not found in GCS' }, { status: 404 });
    }

    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8'));
    
    const itemIndex = data.findIndex((item: any) => item.vector_index === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: `Item ${id} not found` }, { status: 404 });
    }

    // Mark as rejected
    data[itemIndex].status = 'rejected';
    
    // Upload modified JSON back to GCS
    await file.save(JSON.stringify(data, null, 2), {
      contentType: 'application/json',
      cacheControl: 'no-cache',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
