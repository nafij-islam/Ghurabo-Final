import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel, TripModel, GalleryModel } from '@/lib/db/models';
import { getCurrentUser } from '@/lib/auth/session';

// GET User Profile by ID, Email, or Username
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('id') || searchParams.get('username');

    const conn = await connectToDatabase();

    if (identifier && conn) {
      const cleanId = identifier.trim();
      // Find in Atlas by ID, Email, or Name match
      let user = await UserModel.findOne({ id: cleanId });
      if (!user) {
        user = await UserModel.findOne({ email: cleanId.toLowerCase() });
      }
      if (!user) {
        const decoded = decodeURIComponent(cleanId).replace(/-/g, ' ');
        user = await UserModel.findOne({ name: { $regex: new RegExp(`^${decoded}$`, 'i') } });
      }
      if (user) {
        return NextResponse.json({ success: true, user });
      }
    }

    // Fallback: Return current logged in user profile if no identifier passed
    const sessionUser = await getCurrentUser();
    if (sessionUser) {
      if (conn) {
        const currentUserDoc = await UserModel.findOne({ email: sessionUser.email.toLowerCase() });
        if (currentUserDoc) {
          return NextResponse.json({ success: true, user: currentUserDoc });
        }
      }
      return NextResponse.json({ success: true, user: sessionUser });
    }

    const db = getMemoryDb();
    if (identifier) {
      const cleanId = identifier.trim().toLowerCase();
      const matchUser = db.users.find(
        (u) =>
          u.id === identifier ||
          u.email.toLowerCase() === cleanId ||
          u.name.toLowerCase() === cleanId ||
          u.name.toLowerCase().replace(/\s+/g, '-') === cleanId
      );
      if (matchUser) {
        return NextResponse.json({ success: true, user: matchUser });
      }
    }

    return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

// PUT / UPDATE User Profile (MongoDB Atlas Sync)
export async function PUT(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar, coverImage, bio, location, preferredStyle } = body;

    const conn = await connectToDatabase();

    if (conn) {
      // Update User in MongoDB Atlas strictly for authenticated session user
      const updatedUser = await UserModel.findOneAndUpdate(
        { $or: [{ id: sessionUser.id }, { email: sessionUser.email.toLowerCase() }] },
        {
          $set: {
            ...(name && { name: name.trim() }),
            ...(avatar && { avatar: avatar.trim() }),
            ...(coverImage && { coverImage: coverImage.trim() }),
            ...(bio && { bio: bio.trim() }),
            ...(location && { location: location.trim() }),
            ...(preferredStyle && { preferredStyle }),
          },
        },
        { new: true, upsert: true }
      );

      // Cascade update to user's trips & gallery items
      if (name || avatar) {
        await TripModel.updateMany(
          { $or: [{ userId: updatedUser.id }, { userName: sessionUser.name }] },
          {
            $set: {
              ...(name && { userName: updatedUser.name }),
              ...(avatar && { userAvatar: updatedUser.avatar }),
            },
          }
        );

        await GalleryModel.updateMany(
          { $or: [{ photographerId: updatedUser.id }, { photographerName: sessionUser.name }] },
          {
            $set: {
              ...(name && { photographerName: updatedUser.name }),
              ...(avatar && { photographerAvatar: updatedUser.avatar }),
            },
          }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully in MongoDB Atlas!',
      });
    }

    // In-Memory fallback update
    const db = getMemoryDb();
    const memUserIndex = db.users.findIndex(
      (u) => u.id === sessionUser.id || u.email.toLowerCase() === sessionUser.email.toLowerCase()
    );

    if (memUserIndex !== -1) {
      const u = db.users[memUserIndex];
      if (name) u.name = name.trim();
      if (avatar) u.avatar = avatar.trim();
      if (coverImage) u.coverImage = coverImage.trim();
      if (bio) u.bio = bio.trim();
      if (location) u.location = location.trim();
      if (preferredStyle) u.preferredStyle = preferredStyle;

      return NextResponse.json({
        success: true,
        user: u,
        message: 'Profile updated successfully!',
      });
    }

    return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
