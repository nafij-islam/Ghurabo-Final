import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  const sessionUser = await getCurrentUser();
  // Ensure basic admin check or allow view in demo
  const db = getMemoryDb();

  return NextResponse.json({
    success: true,
    stats: {
      totalTrips: db.trips.length,
      pendingApprovals: db.pendingApprovals.length,
      totalUsers: db.users.length,
      totalDestinations: db.destinations.length,
      totalGalleryImages: db.gallery.length,
    },
    pendingTrips: db.pendingApprovals,
    publishedTrips: db.trips,
    drafts: db.drafts,
  });
}

export async function POST(request: Request) {
  try {
    const { tripId, action, notes } = await request.json();
    const db = getMemoryDb();

    const pendingIndex = db.pendingApprovals.findIndex((t) => t.id === tripId);
    if (pendingIndex === -1) {
      // Check if it's already in active trips
      const activeTrip = db.trips.find((t) => t.id === tripId);
      if (activeTrip) {
        if (action === 'reject') {
          activeTrip.status = 'rejected';
          db.trips = db.trips.filter((t) => t.id !== tripId);
        } else if (action === 'verify') {
          activeTrip.isVerified = true;
        }
        return NextResponse.json({ success: true, message: `Trip status updated to ${action}` });
      }
      return NextResponse.json({ success: false, error: 'Trip not found in moderation queue' }, { status: 404 });
    }

    const trip = db.pendingApprovals[pendingIndex];

    if (action === 'approve') {
      trip.status = 'approved';
      db.trips.unshift(trip);
      db.pendingApprovals.splice(pendingIndex, 1);
    } else if (action === 'reject') {
      trip.status = 'rejected';
      db.pendingApprovals.splice(pendingIndex, 1);
    } else if (action === 'verify') {
      trip.isVerified = true;
    }

    return NextResponse.json({
      success: true,
      message: `Trip ${action}d successfully`,
      trip,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Moderation action failed' }, { status: 500 });
  }
}
