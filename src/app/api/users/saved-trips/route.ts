import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { SavedTripModel, TripModel } from '@/lib/db/models';
import { getVerifiedUser } from '@/lib/auth/serverAuth';

const TRIP_CARD_FIELDS = 'id slug title coverImage destinationId destinationName travelType travellersCount durationDays costBreakdown ratings isVerified isPopular status userName userAvatar summary createdAt likesCount savesCount helpfulVotesCount commentsCount';

export async function GET(request: Request) {
  try {
    const currentUser = await getVerifiedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Sign in required' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const savedDocs = await SavedTripModel.find({ userId: currentUser.id })
        .sort({ createdAt: -1 })
        .lean();

      const tripIds = savedDocs.map((s: any) => s.tripId);
      const savedTrips = await TripModel.find({ id: { $in: tripIds } })
        .select(TRIP_CARD_FIELDS)
        .lean();

      return NextResponse.json({ success: true, savedTrips });
    }

    const db = getMemoryDb();
    return NextResponse.json({ success: true, savedTrips: db.trips.slice(0, 2) });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch saved trips' }, { status: 500 });
  }
}
