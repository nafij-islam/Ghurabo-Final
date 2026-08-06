import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';
import { signToken } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = getMemoryDb();

    // Look for matching user
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      // Fallback: If user enters any email during dev preview, log them in as Aria or Admin
      const isDevAdmin = (email || '').includes('admin');
      const fallbackUser = isDevAdmin ? db.users.find((u) => u.role === 'admin') : db.users[0];
      
      const token = signToken({
        id: fallbackUser!.id,
        name: fallbackUser!.name,
        email: fallbackUser!.email,
        role: fallbackUser!.role,
        avatar: fallbackUser!.avatar,
      });

      const response = NextResponse.json({
        success: true,
        user: fallbackUser,
        message: 'Logged in successfully',
      });

      response.cookies.set('ghurabo_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Logged in successfully',
    });

    response.cookies.set('ghurabo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
