import { NextResponse } from 'next/server';
import { db, seedDemoData } from '@/lib/db';

export async function POST() {
  try {
    seedDemoData(db);
    return NextResponse.json({
      success: true,
      message: 'Demo dataset successfully refreshed with B.Tech Engineering courses and active deadlines.',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Could not reset dataset' }, { status: 500 });
  }
}
