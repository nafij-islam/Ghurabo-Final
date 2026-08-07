import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';
import { IUser } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { name, email, password, preferredStyle, bio, location } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.toLowerCase().trim())) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const userRole = 'traveller';

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const conn = await connectToDatabase();

    if (conn) {
      const existingUser = await UserModel.findOne({ email: cleanEmail });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'An account with this email address already exists' }, { status: 400 });
      }

      const userId = `user_${Date.now()}`;
      const newUser = await UserModel.create({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: userRole,
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        bio: bio || 'Passionate traveller & community explorer.',
        location: location || 'Dhaka, Bangladesh',
        preferredStyle: preferredStyle || 'Solo',
        visitedCount: 1,
        followersCount: 0,
        followingCount: 0,
        totalHelpfulVotes: 0,
        badges: ['New Explorer'],
      });

      const token = signToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      });

      const userObj = newUser.toObject ? newUser.toObject() : newUser;
      delete userObj.passwordHash;

      const response = NextResponse.json({
        success: true,
        user: userObj,
        message: 'Account created successfully',
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

    // In-memory fallback
    const db = getMemoryDb();
    const existingMemoryUser = db.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (existingMemoryUser) {
      return NextResponse.json({ success: false, error: 'An account with this email address already exists' }, { status: 400 });
    }

    const userId = `user_${Date.now()}`;
    const newUser: IUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role: userRole,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      bio: bio || 'Passionate traveller & community explorer.',
      location: location || 'Dhaka, Bangladesh',
      preferredStyle: preferredStyle || 'Solo',
      visitedCount: 1,
      followersCount: 0,
      followingCount: 0,
      totalHelpfulVotes: 0,
      badges: ['New Explorer'],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    const token = signToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: 'Account created successfully',
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
  } catch (error: any) {
    console.error('Signup Route Error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed due to a server error' }, { status: 500 });
  }
}
