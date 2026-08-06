import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { IUser } from '@/types';
import { getMemoryDb } from '../db/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'ghurabo-secret-key-production-2026-super-secure';
const COOKIE_NAME = 'ghurabo_session';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'traveller' | 'admin';
  avatar?: string;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function findUserByEmail(email: string): IUser | null {
  const db = getMemoryDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export function findUserById(id: string): IUser | null {
  const db = getMemoryDb();
  const user = db.users.find((u) => u.id === id);
  return user || null;
}
