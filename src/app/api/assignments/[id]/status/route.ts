import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'node:crypto';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const assignment = db.prepare(`
    SELECT a.*, s.name as subject_name, s.code as subject_code
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.id = ? AND a.user_id = ?
  `).get(id, user.id) as any;

  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

  try {
    const body = await req.json();
    const newStatus = body.status;

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'].includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const completedAt = newStatus === 'COMPLETED' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE assignments
      SET status = ?, completed_at = ?
      WHERE id = ? AND user_id = ?
    `).run(newStatus, completedAt, id, user.id);

    // If marked completed, add to notification history
    if (newStatus === 'COMPLETED' && assignment.status !== 'COMPLETED') {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, assignment_id)
        VALUES (?, ?, ?, ?, 'TASK_COMPLETED', 0, ?)
      `).run(
        'notif_' + crypto.randomUUID().slice(0, 8),
        user.id,
        `🎉 Finalized: ${assignment.subject_code}`,
        `Awesome work! You finalized "${assignment.title}". Dual-tracking record updated.`,
        id
      );
    }

    const updated = db.prepare(`
      SELECT a.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.id = ?
    `).get(id);

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Could not update status' }, { status: 500 });
  }
}
