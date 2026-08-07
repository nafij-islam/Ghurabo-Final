import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { GalleryModel, TripModel } from '@/lib/db/models';

const GALLERY_FIELDS = 'id url caption tripId tripTitle tripSlug destinationName travelType photographerName photographerAvatar photographerId likesCount createdAt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const travelType = searchParams.get('travelType');
    const destination = searchParams.get('destination')?.toLowerCase();

    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(60, Math.max(1, Number(searchParams.get('limit')) || 24));
    const skip = (page - 1) * limit;

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

      const [gallery, total] = await Promise.all([
        GalleryModel.find(query)
          .select(GALLERY_FIELDS)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        GalleryModel.countDocuments(query),
      ]);

      const response = NextResponse.json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        gallery,
      });

      response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return response;
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

    const paginatedGallery = gallery.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      total: gallery.length,
      page,
      limit,
      totalPages: Math.ceil(gallery.length / limit),
      gallery: paginatedGallery,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery photos' }, { status: 500 });
  }
}
