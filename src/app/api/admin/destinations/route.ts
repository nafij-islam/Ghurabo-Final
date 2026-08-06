import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { DestinationModel } from '@/lib/db/models';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const destinations = await DestinationModel.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, destinations });
    }

    const db = getMemoryDb();
    return NextResponse.json({ success: true, destinations: db.destinations });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin destinations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { destinationId, isPopular } = await request.json();
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(destinationId);
      const query = isObjectId ? { $or: [{ id: destinationId }, { _id: destinationId }] } : { id: destinationId };

      const updated = await DestinationModel.findOneAndUpdate(
        query,
        { $set: { isPopular: Boolean(isPopular) } },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Destination marked as ${isPopular ? 'Popular' : 'Standard'}`,
        destination: updated,
      });
    }

    const db = getMemoryDb();
    const dest = db.destinations.find((d) => d.id === destinationId);
    if (dest) {
      dest.isPopular = Boolean(isPopular);
      return NextResponse.json({ success: true, destination: dest });
    }

    return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Action failed' }, { status: 500 });
  }
}
