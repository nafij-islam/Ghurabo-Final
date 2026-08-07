import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const cleanEmail = sessionUser.email.toLowerCase().trim();
    const conn = await connectToDatabase();

    if (conn) {
      const atlasUser = await UserModel.findOne({ email: cleanEmail });
      if (atlasUser) {
        const formattedUser = atlasUser.toObject ? atlasUser.toObject() : atlasUser;
        if (!formattedUser.id) formattedUser.id = String(formattedUser._id);

        return NextResponse.json({
          success: true,
          user: formattedUser,
        });
      }
    }

    const db = getMemoryDb();
    const memoryUser = db.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (memoryUser) {
      return NextResponse.json({
        success: true,
        user: memoryUser,
      });
    }

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
