import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';
import { IUser } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { name, email, preferredStyle, bio, location } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
    }

    if (!email || !EMAIL_REGEX.test(email.toLowerCase().trim())) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const userRole = 'traveller'; // Default signups to traveller role

    const conn = await connectToDatabase();

    if (conn) {
      const existingUser = await UserModel.findOne({ email: cleanEmail });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 400 });
      }

      const newUser = await UserModel.create({
        id: `user_${Date.now()}`,
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
      });

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
        message: 'Account created successfully in MongoDB Atlas',
      });

      response.cookies.set('ghurabo_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // In-memory fallback
    const db = getMemoryDb();
    const existingMemoryUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingMemoryUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 400 });
    }

    const newUser: IUser = {
      id: `user_${Date.now()}`,
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
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
