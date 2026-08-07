import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser || !sessionUser.email) {
      const response = NextResponse.json({ success: false, user: null }, { status: 401 });
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return response;
    }

    const cleanEmail = sessionUser.email.toLowerCase().trim();
    const conn = await connectToDatabase();

    if (conn) {
      const atlasUser = await UserModel.findOne({ email: cleanEmail }).select('-passwordHash');
      if (atlasUser) {
        const formattedUser = atlasUser.toObject ? atlasUser.toObject() : atlasUser;
        if (!formattedUser.id) formattedUser.id = String(formattedUser._id);
        delete formattedUser.passwordHash;

        const response = NextResponse.json({
          success: true,
          user: formattedUser,
        });
        response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        return response;
      }
    }

    const db = getMemoryDb();
    const memoryUser = db.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (memoryUser) {
      const response = NextResponse.json({
        success: true,
        user: memoryUser,
      });
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return response;
    }

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    const response = NextResponse.json({ success: false, user: null }, { status: 500 });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  }
}
