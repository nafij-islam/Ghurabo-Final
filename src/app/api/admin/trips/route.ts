import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { TripModel, UserModel, DestinationModel, GalleryModel } from '@/lib/db/models';
import { getAdminUser } from '@/lib/auth/serverAuth';

export async function GET() {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

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
        TripModel.find({ status: 'pending' }).sort({ createdAt: -1 }).lean(),
        TripModel.find({ status: 'approved' }).sort({ createdAt: -1 }).lean(),
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
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { tripId, action } = await request.json();
    if (!tripId || !action) {
      return NextResponse.json({ success: false, error: 'tripId and action are required' }, { status: 400 });
    }

    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(tripId);
      const query = isObjectId ? { $or: [{ id: tripId }, { _id: tripId }] } : { id: tripId };

      if (action === 'approve') {
        const trip = await TripModel.findOneAndUpdate(
          query,
          { $set: { status: 'approved' } },
          { new: true }
        );

        if (!trip) {
          return NextResponse.json({ success: false, error: 'Trip not found in database' }, { status: 404 });
        }

        // Increment destination trip count
        await DestinationModel.updateOne(
          { name: trip.destinationName },
          { $inc: { totalTrips: 1 } }
        );

        return NextResponse.json({ success: true, message: 'Trip approved successfully', trip });
      } else if (action === 'reject' || action === 'delete') {
        if (action === 'delete') {
          await TripModel.deleteOne(query);
          return NextResponse.json({ success: true, message: 'Trip deleted successfully' });
        }
        const trip = await TripModel.findOneAndUpdate(
          query,
          { $set: { status: 'rejected' } },
          { new: true }
        );

        if (!trip) {
          return NextResponse.json({ success: false, error: 'Trip not found in database' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Trip rejected successfully', trip });
      } else if (action === 'verify') {
        const current = await TripModel.findOne(query);
        if (!current) {
          return NextResponse.json({ success: false, error: 'Trip not found in database' }, { status: 404 });
        }

        const trip = await TripModel.findOneAndUpdate(
          query,
          { $set: { isVerified: !current.isVerified } },
          { new: true }
        );

        return NextResponse.json({ success: true, message: 'Trip verification badge toggled', trip });
      } else if (action === 'togglePopular') {
        const current = await TripModel.findOne(query);
        if (!current) {
          return NextResponse.json({ success: false, error: 'Trip not found in database' }, { status: 404 });
        }

        const trip = await TripModel.findOneAndUpdate(
          query,
          { $set: { isPopular: !current.isPopular } },
          { new: true }
        );

        return NextResponse.json({ success: true, message: 'Trip popular status toggled', trip });
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
      } else if (action === 'reject' || action === 'delete') {
        db.pendingApprovals.splice(pendingIndex, 1);
      }
      return NextResponse.json({ success: true, trip });
    }

    const activeTrip = db.trips.find((t) => t.id === tripId);
    if (activeTrip) {
      if (action === 'verify') activeTrip.isVerified = !activeTrip.isVerified;
      if (action === 'togglePopular') activeTrip.isPopular = !activeTrip.isPopular;
      return NextResponse.json({ success: true, trip: activeTrip });
    }

    return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Admin action failed' }, { status: 500 });
  }
}
