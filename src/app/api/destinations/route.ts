import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { DestinationModel, TripModel } from '@/lib/db/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category');
    const country = searchParams.get('country');

    const conn = await connectToDatabase();

    if (conn) {
      const query: any = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { country: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      if (country) {
        query.country = { $regex: new RegExp(`^${country}$`, 'i') };
      }

      const destinations = await DestinationModel.find(query).lean();

      // Recalculate trip counts dynamically from Atlas
      for (const dest of destinations) {
        const tripCount = await TripModel.countDocuments({
          $or: [{ destinationId: dest.id }, { destinationName: dest.name }],
          status: 'approved',
        });
        dest.totalTrips = tripCount;
      }

      return NextResponse.json({
        success: true,
        total: destinations.length,
        destinations,
      });
    }

    // In-Memory Fallback
    const db = getMemoryDb();
    let destinations = [...db.destinations];

    if (q) {
      destinations = destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      destinations = destinations.filter((d) => d.category.toLowerCase() === category.toLowerCase());
    }

    destinations.forEach((dest) => {
      const matchingTrips = db.trips.filter((t) => t.destinationId === dest.id || t.destinationName === dest.name);
      dest.totalTrips = matchingTrips.length;
    });

    return NextResponse.json({
      success: true,
      total: destinations.length,
      destinations,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch destinations' }, { status: 500 });
  }
}
