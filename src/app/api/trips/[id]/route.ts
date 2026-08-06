import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = getMemoryDb();
  const idOrSlug = params.id;

  const trip = db.trips.find((t) => t.id === idOrSlug || t.slug === idOrSlug) ||
    db.pendingApprovals.find((t) => t.id === idOrSlug || t.slug === idOrSlug) ||
    db.drafts.find((t) => t.id === idOrSlug || t.slug === idOrSlug);

  if (!trip) {
    return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
  }

  // Get related trips from same destination or traveller
  const relatedTrips = db.trips
    .filter((t) => t.id !== trip.id && (t.destinationId === trip.destinationId || t.travelType === trip.travelType))
    .slice(0, 3);

  const authorTrips = db.trips
    .filter((t) => t.id !== trip.id && t.userId === trip.userId)
    .slice(0, 3);

  return NextResponse.json({
    success: true,
    trip,
    relatedTrips,
    authorTrips,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getMemoryDb();
    const body = await request.json();
    const idOrSlug = params.id;

    const tripIndex = db.trips.findIndex((t) => t.id === idOrSlug || t.slug === idOrSlug);
    if (tripIndex === -1) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    if (body.action === 'like') {
      db.trips[tripIndex].likesCount += 1;
    } else if (body.action === 'save') {
      db.trips[tripIndex].savesCount += 1;
    } else if (body.action === 'helpful') {
      db.trips[tripIndex].helpfulVotesCount += 1;
    } else {
      Object.assign(db.trips[tripIndex], body);
    }

    return NextResponse.json({
      success: true,
      trip: db.trips[tripIndex],
      message: 'Trip updated successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = getMemoryDb();
  const id = params.id;
  db.trips = db.trips.filter((t) => t.id !== id);
  db.pendingApprovals = db.pendingApprovals.filter((t) => t.id !== id);
  db.drafts = db.drafts.filter((t) => t.id !== id);

  return NextResponse.json({ success: true, message: 'Trip deleted' });
}
