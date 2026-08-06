import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';
import { signToken } from '@/lib/auth/session';
import { IUser } from '@/types';

export async function POST(request: Request) {
  try {
    const { name, email, role, preferredStyle, bio, location } = await request.json();
    const db = getMemoryDb();

    const existingUser = db.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const newUser: IUser = {
      id: `user_${Date.now()}`,
      name: name || 'Explorer',
      email: email || `user${Date.now()}@ghurabo.com`,
      role: role === 'admin' ? 'admin' : 'traveller',
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
