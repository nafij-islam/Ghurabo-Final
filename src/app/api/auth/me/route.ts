import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const atlasUser = await UserModel.findOne({ email: sessionUser.email.toLowerCase() });
      if (atlasUser) {
        return NextResponse.json({
          success: true,
          user: atlasUser,
        });
      }
    }

    const db = getMemoryDb();
    const memoryUser = db.users.find((u) => u.email.toLowerCase() === sessionUser.email.toLowerCase()) || sessionUser;

    return NextResponse.json({
      success: true,
      user: memoryUser,
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
