import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { TripModel } from '@/lib/db/models';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      const trip = await TripModel.findOne(query);

      if (trip) {
        // Fetch related trips from Atlas
        const [relatedTrips, authorTrips] = await Promise.all([
          TripModel.find({
            id: { $ne: trip.id },
            status: 'approved',
            $or: [{ destinationId: trip.destinationId }, { travelType: trip.travelType }],
          })
            .limit(3)
            .sort({ createdAt: -1 }),
          TripModel.find({
            id: { $ne: trip.id },
            status: 'approved',
            userId: trip.userId,
          })
            .limit(3)
            .sort({ createdAt: -1 }),
        ]);

        return NextResponse.json({
          success: true,
          trip,
          relatedTrips,
          authorTrips,
        });
      }
    }

    // In-Memory Fallback
    const db = getMemoryDb();
    const trip =
      db.trips.find((t) => t.id === idOrSlug || t.slug === idOrSlug) ||
      db.pendingApprovals.find((t) => t.id === idOrSlug || t.slug === idOrSlug) ||
      db.drafts.find((t) => t.id === idOrSlug || t.slug === idOrSlug);

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip story not found' }, { status: 404 });
    }

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
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch trip details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    const body = await request.json();
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      let update: any = {};
      if (body.action === 'like') {
        update = { $inc: { likesCount: 1 } };
      } else if (body.action === 'save') {
        update = { $inc: { savesCount: 1 } };
      } else if (body.action === 'helpful') {
        update = { $inc: { helpfulVotesCount: 1 } };
      } else {
        update = { $set: body };
      }

      const updatedTrip = await TripModel.findOneAndUpdate(query, update, { new: true });
      if (updatedTrip) {
        return NextResponse.json({
          success: true,
          trip: updatedTrip,
          message: 'Trip updated successfully',
        });
      }
    }

    // In-Memory Fallback
    const db = getMemoryDb();
    const tripIndex = db.trips.findIndex((t) => t.id === idOrSlug || t.slug === idOrSlug);
    if (tripIndex !== -1) {
      if (body.action === 'like') db.trips[tripIndex].likesCount += 1;
      else if (body.action === 'save') db.trips[tripIndex].savesCount += 1;
      else if (body.action === 'helpful') db.trips[tripIndex].helpfulVotesCount += 1;
      else Object.assign(db.trips[tripIndex], body);

      return NextResponse.json({
        success: true,
        trip: db.trips[tripIndex],
        message: 'Trip updated successfully',
      });
    }

    return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      await TripModel.deleteOne(query);
      return NextResponse.json({ success: true, message: 'Trip deleted from MongoDB Atlas' });
    }

    const db = getMemoryDb();
    db.trips = db.trips.filter((t) => t.id !== idOrSlug && t.slug !== idOrSlug);
    return NextResponse.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete trip' }, { status: 500 });
  }
}
