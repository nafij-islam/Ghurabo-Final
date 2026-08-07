import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';
import { signToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  console.log('--- POST /api/auth/google Handler Execution Started ---');

  // Stage 1: Validate Environment Variables (Non-sensitive check)
  const hasProjId = !!process.env.FIREBASE_PROJECT_ID;
  const hasEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  const hasKey = !!process.env.FIREBASE_PRIVATE_KEY;

  if (!hasProjId || !hasEmail || !hasKey) {
    console.warn(`⚠️ Stage 1 Warning: Missing Vercel Env Vars (ProjectID: ${hasProjId}, ClientEmail: ${hasEmail}, PrivateKey: ${hasKey}). Using secure built-in fallback credentials.`);
  }

  // Stage 2: Read Body & Validate ID Token Presence
  let idToken: string;
  try {
    const body = await request.json();
    idToken = body.idToken;
  } catch (e) {
    console.error('❌ Stage 2 Failed: Unable to parse JSON body');
    return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
  }

  if (!idToken || typeof idToken !== 'string') {
    console.error('❌ Stage 2 Failed: ID token is missing or not a string');
    return NextResponse.json({ success: false, error: 'Firebase ID token is required.' }, { status: 400 });
  }

  // Stage 3: Server-side Firebase ID token verification using Firebase Admin SDK
  let decodedToken: any;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log(`✓ Stage 3 Passed: Firebase ID token verified for UID: ${decodedToken.uid}`);
  } catch (authErr: any) {
    console.error('❌ Stage 3 Failed: verifyIdToken failed with error:', authErr?.message || authErr);
    return NextResponse.json(
      { success: false, error: `Google token verification failed: ${authErr?.message || 'Invalid or expired token'}` },
      { status: 401 }
    );
  }

  const email = decodedToken.email;
  if (!email) {
    console.error('❌ Stage 3 Failed: Decoded token contains no email address');
    return NextResponse.json(
      { success: false, error: 'No verified email address associated with this Google account.' },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();

  // Stage 4: MongoDB Atlas Connection & User Matching / Creation
  let userObj: any = null;

  try {
    const conn = await connectToDatabase();

    if (conn) {
      console.log(`✓ Stage 4: Searching MongoDB Atlas for email: ${cleanEmail}`);
      let atlasUser = await UserModel.findOne({ email: cleanEmail });

      if (atlasUser) {
        console.log(`✓ Stage 4: Existing MongoDB user found (ID: ${atlasUser.id || atlasUser._id})`);
        const updates: Record<string, any> = {};
        if (!atlasUser.googleUid) updates.googleUid = decodedToken.uid;
        if (!atlasUser.authProvider) updates.authProvider = 'google';
        if (!atlasUser.avatar && decodedToken.picture) updates.avatar = decodedToken.picture;

        if (Object.keys(updates).length > 0) {
          await UserModel.updateOne({ _id: atlasUser._id }, { $set: updates });
        }

        userObj = atlasUser.toObject ? atlasUser.toObject() : atlasUser;
      } else {
        console.log(`✓ Stage 4: No existing user found. Creating new MongoDB user for email: ${cleanEmail}`);
        const googleName = decodedToken.name || cleanEmail.split('@')[0];
        const newUserId = `user_google_${Date.now()}`;

        const newDoc = await UserModel.create({
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

        userObj = newDoc.toObject ? newDoc.toObject() : newDoc;
      }
    } else {
      console.warn('⚠️ Stage 4: Database fallback to memory store');
      const db = getMemoryDb();
      let memUser = db.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

      if (!memUser) {
        memUser = {
          id: `user_google_${Date.now()}`,
          name: decodedToken.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          authProvider: 'google',
          googleUid: decodedToken.uid,
          avatar: decodedToken.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
          role: 'traveller',
          createdAt: new Date().toISOString(),
        };
        db.users.push(memUser);
      }
      userObj = memUser;
    }
  } catch (dbErr: any) {
    console.error('❌ Stage 4 Failed: Database operation error:', dbErr?.message || dbErr);
    return NextResponse.json(
      { success: false, error: `Database error during user account matching: ${dbErr?.message || 'DB Error'}` },
      { status: 500 }
    );
  }

  // Stage 5: Session Creation & Cookie Response
  try {
    const mongoUserId = userObj.id || String(userObj._id);
    userObj.id = mongoUserId;
    delete userObj.passwordHash;

    const token = signToken({
      id: mongoUserId,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role || 'traveller',
      avatar: userObj.avatar,
    });

    console.log(`✓ Stage 5 Passed: JWT issued for user ${userObj.email} (ID: ${mongoUserId})`);

    const response = NextResponse.json({
      success: true,
      user: userObj,
      message: 'Logged in with Google successfully',
    });

    response.cookies.set('ghurabo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (sessionErr: any) {
    console.error('❌ Stage 5 Failed: Session creation error:', sessionErr?.message || sessionErr);
    return NextResponse.json(
      { success: false, error: 'Session generation failed.' },
      { status: 500 }
    );
  }
}
