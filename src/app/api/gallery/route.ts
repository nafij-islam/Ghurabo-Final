import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { GalleryModel, TripModel } from '@/lib/db/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const travelType = searchParams.get('travelType');
    const destination = searchParams.get('destination')?.toLowerCase();

    const conn = await connectToDatabase();

    if (conn) {
      // Find IDs of all APPROVED trips to guarantee pending/draft/rejected photos never leak
      const approvedTripIds = await TripModel.find({ status: 'approved' }).distinct('id');

      const query: any = {
        tripId: { $in: approvedTripIds },
      };

      if (q) {
        query.$or = [
          { caption: { $regex: q, $options: 'i' } },
          { destinationName: { $regex: q, $options: 'i' } },
          { photographerName: { $regex: q, $options: 'i' } },
          { tripTitle: { $regex: q, $options: 'i' } },
        ];
      }

      if (travelType && travelType !== 'All') {
        query.travelType = travelType;
      }

      if (destination) {
        query.destinationName = { $regex: destination, $options: 'i' };
      }

      const gallery = await GalleryModel.find(query).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
        success: true,
        total: gallery.length,
        gallery,
      });
    }

    // In-Memory Fallback
    const db = getMemoryDb();
    const approvedTripIds = new Set(db.trips.filter((t) => t.status === 'approved').map((t) => t.id));
    let gallery = db.gallery.filter((item) => approvedTripIds.has(item.tripId));

    if (q) {
      gallery = gallery.filter(
        (item) =>
          item.caption?.toLowerCase().includes(q) ||
          item.destinationName.toLowerCase().includes(q) ||
          item.photographerName.toLowerCase().includes(q) ||
          item.tripTitle?.toLowerCase().includes(q)
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
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery photos' }, { status: 500 });
  }
}
