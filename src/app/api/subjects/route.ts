import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import crypto from 'node:crypto';

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(2, 'Course code is required (e.g. CS601)'),
  professor: z.string().optional(),
  color: z.string().default('#3b82f6'),
  credits: z.number().int().min(1).max(10).default(3),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subjects = db.prepare(`
    SELECT
      s.*,
      COUNT(a.id) as total_tasks,
      SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN a.status != 'COMPLETED' THEN 1 ELSE 0 END) as active_tasks
    FROM subjects s
    LEFT JOIN assignments a ON a.subject_id = s.id
    WHERE s.user_id = ?
    GROUP BY s.id
    ORDER BY s.name ASC
  `).all(user.id);

  return NextResponse.json({ success: true, subjects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = subjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
    }

    const { name, code, professor, color, credits } = parsed.data;
    const id = 'sub_' + crypto.randomUUID().slice(0, 10);

    const insert = db.prepare(`
      INSERT INTO subjects (id, user_id, name, code, professor, color, credits)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(id, user.id, name, code.toUpperCase(), professor || null, color, credits);

    const created = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);

    return NextResponse.json({ success: true, subject: created }, { status: 201 });
  } catch (error) {
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Could not create subject' }, { status: 500 });
  }
}
