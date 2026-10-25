import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  subjectId: z.string().optional(),
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  taskType: z.enum(['ASSIGNMENT', 'LAB_RECORD', 'PROJECT_REPORT', 'QUIZ_PREP', 'PRACTICE_PROBLEMS']).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  submissionType: z.enum(['ONLINE_PORTAL', 'HARD_COPY', 'GITHUB_REPO', 'EMAIL']).optional(),
  submissionLink: z.string().nullable().optional(),
  estimatedHours: z.number().optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const assignment = db.prepare(`
    SELECT a.*, s.name as subject_name, s.code as subject_code, s.color as subject_color, s.professor as subject_professor
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.id = ? AND a.user_id = ?
  `).get(id, user.id);

  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  return NextResponse.json({ success: true, assignment });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = db.prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?').get(id, user.id) as any;
  if (!existing) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update data', details: parsed.error.format() }, { status: 400 });
    }

    const d = parsed.data;
    const subjectId = d.subjectId ?? existing.subject_id;
    const title = d.title ?? existing.title;
    const description = d.description !== undefined ? d.description : existing.description;
    const taskType = d.taskType ?? existing.task_type;
    const dueDate = d.dueDate ? new Date(d.dueDate).toISOString() : existing.due_date;
    const priority = d.priority ?? existing.priority;
    const status = d.status ?? existing.status;
    const submissionType = d.submissionType ?? existing.submission_type;
    const submissionLink = d.submissionLink !== undefined ? d.submissionLink : existing.submission_link;
    const estimatedHours = d.estimatedHours ?? existing.estimated_hours;

    let completedAt = existing.completed_at;
    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      completedAt = new Date().toISOString();
    } else if (status !== 'COMPLETED') {
      completedAt = null;
    }

    db.prepare(`
      UPDATE assignments
      SET subject_id = ?, title = ?, description = ?, task_type = ?,
          due_date = ?, priority = ?, status = ?, submission_type = ?,
          submission_link = ?, estimated_hours = ?, completed_at = ?
      WHERE id = ? AND user_id = ?
    `).run(subjectId, title, description, taskType, dueDate, priority, status, submissionType, submissionLink, estimatedHours, completedAt, id, user.id);

    const updated = db.prepare(`
      SELECT a.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.id = ?
    `).get(id);

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json({ error: 'Could not update assignment' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = db.prepare('SELECT id FROM assignments WHERE id = ? AND user_id = ?').get(id, user.id);
  if (!existing) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  db.prepare('DELETE FROM assignments WHERE id = ? AND user_id = ?').run(id, user.id);
  return NextResponse.json({ success: true, message: 'Assignment deleted' });
}
