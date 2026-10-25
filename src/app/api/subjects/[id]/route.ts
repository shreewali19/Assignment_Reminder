import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  professor: z.string().nullable().optional(),
  color: z.string().optional(),
  credits: z.number().int().min(1).max(10).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?').get(id, user.id) as any;
  if (!existing) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
    }

    const name = parsed.data.name ?? existing.name;
    const code = parsed.data.code ? parsed.data.code.toUpperCase() : existing.code;
    const professor = parsed.data.professor !== undefined ? parsed.data.professor : existing.professor;
    const color = parsed.data.color ?? existing.color;
    const credits = parsed.data.credits ?? existing.credits;

    db.prepare(`
      UPDATE subjects
      SET name = ?, code = ?, professor = ?, color = ?, credits = ?
      WHERE id = ? AND user_id = ?
    `).run(name, code, professor, color, credits, id, user.id);

    const updated = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
    return NextResponse.json({ success: true, subject: updated });
  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json({ error: 'Could not update subject' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = db.prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?').get(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?').run(id, user.id);
  return NextResponse.json({ success: true, message: 'Subject and associated tasks removed' });
}
