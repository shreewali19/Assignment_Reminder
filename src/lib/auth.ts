import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'academic_task_manager_jwt_secret_key_btech_2026_safe';
const COOKIE_NAME = 'academic_auth_token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string | null;
  semester: string | null;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function comparePassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(payload: { id: string; email: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const row = db.prepare('SELECT id, name, email, role, institution, semester FROM users WHERE id = ?').get(decoded.id) as AuthUser | undefined;
    return row || null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
