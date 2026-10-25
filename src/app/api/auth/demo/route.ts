import { NextResponse } from 'next/server';
import { db, seedDemoData } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const demoEmail = 'demo@student.edu';
    let user = db.prepare('SELECT id, name, email, role, institution, semester FROM users WHERE email = ?').get(demoEmail) as
      | { id: string; name: string; email: string; role: string; institution: string; semester: string }
      | undefined;

    if (!user) {
      seedDemoData(db);
      user = db.prepare('SELECT id, name, email, role, institution, semester FROM users WHERE email = ?').get(demoEmail) as any;
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to initialize demo account' }, { status: 500 });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      success: true,
      message: 'Demo account signed in successfully for presentation',
      user,
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
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Could not sign in demo account' }, { status: 500 });
  }
}
