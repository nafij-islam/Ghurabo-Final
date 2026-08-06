import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { TripModel, UserModel, DestinationModel, GalleryModel } from '@/lib/db/models';

export async function GET() {
  try {
    const conn = await connectToDatabase();

    if (conn) {
      const [
        totalTrips,
        pendingApprovalsCount,
        totalUsers,
        totalDestinations,
        totalGalleryImages,
        pendingTrips,
        publishedTrips,
      ] = await Promise.all([
        TripModel.countDocuments({ status: 'approved' }),
        TripModel.countDocuments({ status: 'pending' }),
        UserModel.countDocuments(),
        DestinationModel.countDocuments(),
        GalleryModel.countDocuments(),
        TripModel.find({ status: 'pending' }).sort({ createdAt: -1 }),
        TripModel.find({ status: 'approved' }).sort({ createdAt: -1 }),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          totalTrips,
          pendingApprovals: pendingApprovalsCount,
          totalUsers,
          totalDestinations,
          totalGalleryImages,
        },
        pendingTrips,
        publishedTrips,
      });
    }

    // In-Memory Fallback
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
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tripId, action } = await request.json();
    const conn = await connectToDatabase();

    if (conn) {
      if (action === 'approve') {
        const trip = await TripModel.findOneAndUpdate(
          { $or: [{ id: tripId }, { _id: tripId }] },
          { $set: { status: 'approved' } },
          { new: true }
        );
        return NextResponse.json({ success: true, message: 'Trip approved successfully', trip });
      } else if (action === 'reject') {
        const trip = await TripModel.findOneAndUpdate(
          { $or: [{ id: tripId }, { _id: tripId }] },
          { $set: { status: 'rejected' } },
          { new: true }
        );
        return NextResponse.json({ success: true, message: 'Trip rejected successfully', trip });
      } else if (action === 'verify') {
        const current = await TripModel.findOne({ $or: [{ id: tripId }, { _id: tripId }] });
        const trip = await TripModel.findOneAndUpdate(
          { $or: [{ id: tripId }, { _id: tripId }] },
          { $set: { isVerified: !current?.isVerified } },
          { new: true }
        );
        return NextResponse.json({ success: true, message: 'Trip verification badge toggled', trip });
      }
    }

    // In-Memory Fallback
    const db = getMemoryDb();
    const pendingIndex = db.pendingApprovals.findIndex((t) => t.id === tripId);
    if (pendingIndex !== -1) {
      const trip = db.pendingApprovals[pendingIndex];
      if (action === 'approve') {
        trip.status = 'approved';
        db.trips.unshift(trip);
        db.pendingApprovals.splice(pendingIndex, 1);
      } else if (action === 'reject') {
        trip.status = 'rejected';
        db.pendingApprovals.splice(pendingIndex, 1);
      }
      return NextResponse.json({ success: true, trip });
    }

    const activeTrip = db.trips.find((t) => t.id === tripId);
    if (activeTrip) {
      if (action === 'verify') activeTrip.isVerified = !activeTrip.isVerified;
      return NextResponse.json({ success: true, trip: activeTrip });
    }

    return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Admin action failed' }, { status: 500 });
  }
}
