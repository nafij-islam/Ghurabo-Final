import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();
  const travelType = searchParams.get('travelType');
  const destination = searchParams.get('destination')?.toLowerCase();

  const db = getMemoryDb();
  let gallery = [...db.gallery];

  if (q) {
    gallery = gallery.filter(
      (item) =>
        item.caption?.toLowerCase().includes(q) ||
        item.destinationName.toLowerCase().includes(q) ||
        item.photographerName.toLowerCase().includes(q)
    );
  }

  if (travelType && travelType !== 'All') {
    gallery = gallery.filter((item) => item.travelType === travelType);
  }

  if (destination) {
    gallery = gallery.filter((item) => item.destinationName.toLowerCase().includes(destination));
  }

  return NextResponse.json({
    success: true,
    total: gallery.length,
    gallery,
  });
}
