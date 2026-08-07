import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { CommentModel, TripModel } from '@/lib/db/models';
import { getVerifiedUser, isOwnerOrAdmin } from '@/lib/auth/serverAuth';

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

      const trip = await TripModel.findOne(query).select('id');
      if (!trip) {
        return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      }

      const comments = await CommentModel.find({ tripId: trip.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return NextResponse.json({ success: true, comments });
    }

    const db = getMemoryDb();
    const comments = (db as any).comments || [];
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getVerifiedUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to comment' }, { status: 401 });
    }

    const idOrSlug = params.id;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const cleanContent = content.trim().slice(0, 1000); // Limit to 1000 characters to prevent XSS/overflow
    const conn = await connectToDatabase();

    if (conn) {
      const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
      const query = isObjectId
        ? { $or: [{ id: idOrSlug }, { slug: idOrSlug }, { _id: idOrSlug }] }
        : { $or: [{ id: idOrSlug }, { slug: idOrSlug }] };

      const trip = await TripModel.findOne(query);
      if (!trip) {
        return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      }

      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newComment = await CommentModel.create({
        id: commentId,
        tripId: trip.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar || 'https://i.pravatar.cc/150',
        content: cleanContent,
      });

      // Increment commentsCount on Trip
      trip.commentsCount = (trip.commentsCount || 0) + 1;
      await trip.save();

      return NextResponse.json({
        success: true,
        comment: newComment,
        message: 'Comment posted successfully',
      });
    }

    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to post comment' }, { status: 500 });
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ success: false, error: 'Comment ID required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const comment = await CommentModel.findOne({ id: commentId });
      if (!comment) {
        return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
      }

      if (!isOwnerOrAdmin(comment.userId, currentUser)) {
        return NextResponse.json({ success: false, error: 'Forbidden: You cannot delete this comment' }, { status: 403 });
      }

      await CommentModel.deleteOne({ id: commentId });

      // Decrement commentsCount on Trip
      const isObjectId = mongoose.Types.ObjectId.isValid(params.id);
      const query = isObjectId
        ? { $or: [{ id: params.id }, { slug: params.id }, { _id: params.id }] }
        : { $or: [{ id: params.id }, { slug: params.id }] };

      await TripModel.updateOne(query, { $inc: { commentsCount: -1 } });

      return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete comment' }, { status: 500 });
  }
}
