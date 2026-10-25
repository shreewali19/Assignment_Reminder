import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';
import crypto from 'node:crypto';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid academic or personal email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  institution: z.string().optional(),
  semester: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { name, email, password, institution, semester } = parsed.data;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 409 });
    }

    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const hashed = hashPassword(password);

    const insert = db.prepare(`
      INSERT INTO users (id, name, email, password, role, institution, semester)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      userId,
      name,
      email.toLowerCase(),
      hashed,
      'STUDENT',
      institution || 'Department of Computer Science & Engineering',
      semester || 'Semester 1'
    );

    // Create 3 default academic subjects to get started immediately
    const insertSub = db.prepare(`
      INSERT INTO subjects (id, user_id, name, code, professor, color, credits)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertSub.run('sub_' + crypto.randomUUID().slice(0, 8), userId, 'Computer Networks', 'CS501', 'Prof. Kumar', '#3b82f6', 4);
    insertSub.run('sub_' + crypto.randomUUID().slice(0, 8), userId, 'Operating Systems', 'CS502', 'Dr. Singh', '#10b981', 4);
    insertSub.run('sub_' + crypto.randomUUID().slice(0, 8), userId, 'Database Systems', 'CS503', 'Prof. Sharma', '#8b5cf6', 3);

    const token = signToken({ id: userId, email: email.toLowerCase(), name });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name,
        email: email.toLowerCase(),
        role: 'STUDENT',
        institution: institution || 'Department of Computer Science & Engineering',
        semester: semester || 'Semester 1',
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Could not complete registration' }, { status: 500 });
  }
}
