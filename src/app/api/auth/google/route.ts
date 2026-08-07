import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { connectToDatabase } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ success: false, error: 'Firebase ID token is required' }, { status: 400 });
    }

    // 1. Server-side Firebase ID token verification using Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (authErr: any) {
      console.error('Firebase Admin ID token verification error:', authErr);
      return NextResponse.json({ success: false, error: 'Invalid or expired Google authentication token' }, { status: 401 });
    }

    const email = decodedToken.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'No email address associated with this Google account' }, { status: 400 });
    }

    // Normalize email
    const cleanEmail = email.trim().toLowerCase();
    const conn = await connectToDatabase();

    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database connection error' }, { status: 500 });
    }

    // 2. Search MongoDB Atlas for existing user by normalized email
    let user = await UserModel.findOne({ email: cleanEmail });

    if (user) {
      // Existing User Account: Link Google UID / Provider if not present while preserving role & existing data
      const updates: Record<string, any> = {};
      if (!user.googleUid) updates.googleUid = decodedToken.uid;
      if (!user.authProvider) updates.authProvider = 'google';
      if (!user.avatar && decodedToken.picture) updates.avatar = decodedToken.picture;

      if (Object.keys(updates).length > 0) {
        await UserModel.updateOne({ _id: user._id }, { $set: updates });
      }
    } else {
      // 3. New User Registration: Create MongoDB User with Google Metadata
      const googleName = decodedToken.name || cleanEmail.split('@')[0];
      const newUserId = `user_google_${Date.now()}`;

      user = await UserModel.create({
        id: newUserId,
        name: googleName,
        email: cleanEmail,
        authProvider: 'google',
        googleUid: decodedToken.uid,
        avatar: decodedToken.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        role: 'traveller',
        bio: 'Explorer and community member.',
        location: 'Bangladesh',
        preferredStyle: 'Solo',
        preferredCurrency: 'BDT',
        preferredLanguage: 'en',
        visitedCount: 0,
        followersCount: 0,
        followingCount: 0,
        totalHelpfulVotes: 0,
        badges: ['Google Verified'],
      });
    }

    const mongoUserId = user.id || String(user._id);
    const userObj = user.toObject ? user.toObject() : user;
    userObj.id = mongoUserId;
    delete userObj.passwordHash;

    // 4. Issue Ghurabo JWT Token with MongoDB User ID
    const token = signToken({
      id: mongoUserId,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role || 'traveller',
      avatar: userObj.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: userObj,
      message: 'Logged in with Google successfully',
    });

    // 5. Set HTTP-Only Cookie ghurabo_session
    response.cookies.set('ghurabo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (err: any) {
    console.error('Unhandled error in POST /api/auth/google:', err);
    return NextResponse.json({ success: false, error: 'Server authentication failed' }, { status: 500 });
  }
}
