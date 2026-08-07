import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const conn = await connectToDatabase();

    if (conn) {
      // Find exact user strictly by normalized email
      const atlasUser = await UserModel.findOne({ email: cleanEmail });

      if (atlasUser) {
        // Verify password using bcrypt if passwordHash exists
        if (atlasUser.passwordHash) {
          const isValidPassword = await bcrypt.compare(password, atlasUser.passwordHash);
          if (!isValidPassword) {
            return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
          }
        } else {
          // Legacy migration: set initial passwordHash if missing
          const newHash = await bcrypt.hash(password, 10);
          atlasUser.passwordHash = newHash;
          await UserModel.updateOne({ _id: atlasUser._id }, { $set: { passwordHash: newHash } });
        }

        const userId = atlasUser.id || String(atlasUser._id);

        if (!atlasUser.id) {
          atlasUser.id = userId;
          await UserModel.updateOne({ _id: atlasUser._id }, { $set: { id: userId } });
        }

        const userObj = atlasUser.toObject ? atlasUser.toObject() : atlasUser;
        userObj.id = userId;
        delete userObj.passwordHash;

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
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        return response;
      }
    }

    // In-memory fallback
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
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'No account found with this email address. Please check your email or create an account.' },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('Error during login POST handler:', err);
    return NextResponse.json(
      { success: false, error: 'Server authentication error. Please try again.' },
      { status: 500 }
    );
  }
}
