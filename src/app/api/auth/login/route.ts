import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const conn = await connectToDatabase();

    if (conn) {
      // Search real-time MongoDB Atlas users collection strictly by email
      const atlasUser = await UserModel.findOne({ email: cleanEmail });

      if (atlasUser) {
        const userId = atlasUser.id || String(atlasUser._id);

        // Ensure Mongo Atlas user document has stable id field set
        if (!atlasUser.id) {
          atlasUser.id = userId;
          await UserModel.updateOne({ _id: atlasUser._id }, { $set: { id: userId } });
        }

        const userObj = atlasUser.toObject ? atlasUser.toObject() : atlasUser;
        userObj.id = userId;

        const token = signToken({
          id: userId,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role || 'traveller',
          avatar: userObj.avatar,
        });

        const response = NextResponse.json({
          success: true,
          user: userObj,
          message: 'Logged in successfully',
        });

        response.cookies.set('ghurabo_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }
    }

    // In-memory lookup fallback strictly by normalized email
    const db = getMemoryDb();
    const memoryUser = db.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (memoryUser) {
      const token = signToken({
        id: memoryUser.id,
        name: memoryUser.name,
        email: memoryUser.email,
        role: memoryUser.role || 'traveller',
        avatar: memoryUser.avatar,
      });

      const response = NextResponse.json({
        success: true,
        user: memoryUser,
        message: 'Logged in successfully',
      });

      response.cookies.set('ghurabo_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'No user account found with this email address. Please create an account first.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
