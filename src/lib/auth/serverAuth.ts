import { NextResponse } from 'next/server';
import { getCurrentUser, SessionUser } from './session';
import { connectToDatabase } from '../db/mongodb';
import { UserModel } from '../db/models';

export async function getVerifiedUser(): Promise<SessionUser | null> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return null;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const dbUser = (await UserModel.findOne({ email: sessionUser.email.toLowerCase() }).lean()) as any;
      if (dbUser) {
        return {
          id: dbUser.id || String(dbUser._id),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          avatar: dbUser.avatar,
        };
      }
    }
  } catch (err) {}

  return sessionUser;
}

export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getVerifiedUser();
  if (!user) return null;
  if (user.role === 'admin') return user;
  return null;
}

export function isOwnerOrAdmin(resourceUserId: string, user: SessionUser): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.id === resourceUserId || user.email.toLowerCase() === resourceUserId.toLowerCase();
}
