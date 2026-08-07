import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { DestinationModel, TripModel } from '@/lib/db/models';

const DESTINATION_FIELDS = 'id name slug country division category image heroImage isPopular avgCostSolo avgRating totalTrips description';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(30, Math.max(1, Number(searchParams.get('limit')) || 12));
    const skip = (page - 1) * limit;

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

      const [destinations, total] = await Promise.all([
        DestinationModel.find(query)
          .select(DESTINATION_FIELDS)
          .sort({ isPopular: -1, name: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        DestinationModel.countDocuments(query),
      ]);

      const response = NextResponse.json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        destinations,
      });

      response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return response;
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

    const paginatedDestinations = destinations.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      total: destinations.length,
      page,
      limit,
      totalPages: Math.ceil(destinations.length / limit),
      destinations: paginatedDestinations,
    });
  } catch (error: any) {
    console.error('Destinations Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch destinations' }, { status: 500 });
  }
}
