import { NextResponse } from 'next/server';
import { getCurrentUser, findUserById } from '@/lib/auth/session';

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const fullUser = findUserById(sessionUser.id) || sessionUser;

  return NextResponse.json({
    success: true,
    user: fullUser,
  });
}
