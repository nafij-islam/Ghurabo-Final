import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const conn = await connectToDatabase();

    if (conn) {
      // Search real-time MongoDB Atlas users collection
      const atlasUser = await UserModel.findOne({ email: email.toLowerCase().trim() });

      if (atlasUser) {
        const token = signToken({
          id: atlasUser.id,
          name: atlasUser.name,
          email: atlasUser.email,
          role: atlasUser.role,
          avatar: atlasUser.avatar,
        });

        const response = NextResponse.json({
          success: true,
          user: atlasUser,
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

    // In-memory lookup fallback
    const db = getMemoryDb();
    const memoryUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (memoryUser) {
      const token = signToken({
        id: memoryUser.id,
        name: memoryUser.name,
        email: memoryUser.email,
        role: memoryUser.role,
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

    return NextResponse.json({ success: false, error: 'No user account found with this email address. Please Create Account first.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
