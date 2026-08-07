import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { TripModel, SavedTripModel, TripLikeModel, HelpfulVoteModel, GalleryModel } from '@/lib/db/models';
import { getVerifiedUser, isOwnerOrAdmin } from '@/lib/auth/serverAuth';

const TRIP_CARD_FIELDS = 'id slug title coverImage destinationId destinationName travelType travellersCount durationDays costBreakdown ratings isVerified isPopular status userName userAvatar summary createdAt likesCount savesCount helpfulVotesCount commentsCount';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;
    const conn = await connectToDatabase();
    const currentUser = await getVerifiedUser();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      const trip = (await TripModel.findOne(query).lean()) as any;

      if (trip) {
        let isSaved = false;
        let isLiked = false;
        let isHelpful = false;

        if (currentUser) {
          const [savedDoc, likedDoc, helpfulDoc] = await Promise.all([
            SavedTripModel.exists({ userId: currentUser.id, tripId: trip.id }),
            TripLikeModel.exists({ userId: currentUser.id, tripId: trip.id }),
            HelpfulVoteModel.exists({ userId: currentUser.id, tripId: trip.id }),
          ]);
          isSaved = !!savedDoc;
          isLiked = !!likedDoc;
          isHelpful = !!helpfulDoc;
        }

        // Fetch related trips & author trips in parallel
        const [relatedTrips, authorTrips] = await Promise.all([
          TripModel.find({
            id: { $ne: trip.id },
            status: 'approved',
            $or: [{ destinationId: trip.destinationId }, { travelType: trip.travelType }],
          })
            .select(TRIP_CARD_FIELDS)
            .limit(3)
            .sort({ createdAt: -1 })
            .lean(),
          TripModel.find({
            id: { $ne: trip.id },
            status: 'approved',
            userId: trip.userId,
          })
            .select(TRIP_CARD_FIELDS)
            .limit(3)
            .sort({ createdAt: -1 })
            .lean(),
        ]);

        const response = NextResponse.json({
          success: true,
          trip,
          isSaved,
          isLiked,
          isHelpful,
          relatedTrips,
          authorTrips,
        });

        if (currentUser) {
          response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        } else {
          response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        }
        return response;
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
      isSaved: false,
      isLiked: false,
      isHelpful: false,
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
    const currentUser = await getVerifiedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Sign in required' }, { status: 401 });
    }

    const idOrSlug = params.id;
    const body = await request.json();
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      const existingTrip = await TripModel.findOne(query);
      if (!existingTrip) {
        return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      }

      // Single Atomic Interaction Handlers (Like/Unlike, Save/Unsave, Helpful/Unhelpful)
      if (body.action) {
        const tripId = existingTrip.id;
        const userId = currentUser.id;

        if (body.action === 'like') {
          await TripLikeModel.updateOne({ userId, tripId }, { userId, tripId }, { upsert: true });
          const count = await TripLikeModel.countDocuments({ tripId });
          await TripModel.updateOne(query, { $set: { likesCount: count } });
        } else if (body.action === 'unlike') {
          await TripLikeModel.deleteOne({ userId, tripId });
          const count = await TripLikeModel.countDocuments({ tripId });
          await TripModel.updateOne(query, { $set: { likesCount: count } });
        } else if (body.action === 'save') {
          await SavedTripModel.updateOne({ userId, tripId }, { userId, tripId }, { upsert: true });
          const count = await SavedTripModel.countDocuments({ tripId });
          await TripModel.updateOne(query, { $set: { savesCount: count } });
        } else if (body.action === 'unsave') {
          await SavedTripModel.deleteOne({ userId, tripId });
          const count = await SavedTripModel.countDocuments({ tripId });
          await TripModel.updateOne(query, { $set: { savesCount: count } });
        } else if (body.action === 'helpful') {
          await HelpfulVoteModel.updateOne({ userId, tripId }, { userId, tripId }, { upsert: true });
          const count = await HelpfulVoteModel.countDocuments({ tripId });
          await TripModel.updateOne(query, { $set: { helpfulVotesCount: count } });
        } else if (body.action === 'unhelpful') {
          await HelpfulVoteModel.deleteOne({ userId, tripId });
          const count = await HelpfulVoteModel.countDocuments({ tripId });
          await TripModel.updateOne(query, { $set: { helpfulVotesCount: count } });
        }

        const updated = await TripModel.findOne(query).lean();
        return NextResponse.json({
          success: true,
          trip: updated,
          message: 'Interaction updated successfully',
        });
      }

      // Regular Edit Updates (Requires owner or admin)
      if (!isOwnerOrAdmin(existingTrip.userId, currentUser)) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not have permission to edit this trip' }, { status: 403 });
      }

      const updatedTrip = await TripModel.findOneAndUpdate(query, { $set: body }, { new: true });

      try {
        revalidatePath('/');
        revalidatePath('/trips');
        revalidatePath(`/trips/${existingTrip.slug}`);
        revalidatePath('/dashboard');
      } catch (e) {}

      return NextResponse.json({
        success: true,
        trip: updatedTrip,
        message: 'Trip updated successfully',
      });
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
    const currentUser = await getVerifiedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Sign in required' }, { status: 401 });
    }

    const idOrSlug = params.id;
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      const existingTrip = await TripModel.findOne(query);
      if (!existingTrip) {
        return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      }

      if (!isOwnerOrAdmin(existingTrip.userId, currentUser)) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not have permission to delete this trip' }, { status: 403 });
      }

      await GalleryModel.deleteMany({ tripId: existingTrip.id });
      await TripModel.deleteOne(query);

      try {
        revalidatePath('/');
        revalidatePath('/trips');
        revalidatePath('/gallery');
        revalidatePath('/dashboard');
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Trip deleted from MongoDB Atlas' });
    }

    const db = getMemoryDb();
    db.trips = db.trips.filter((t) => t.id !== idOrSlug && t.slug !== idOrSlug);
    return NextResponse.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete trip' }, { status: 500 });
  }
}
