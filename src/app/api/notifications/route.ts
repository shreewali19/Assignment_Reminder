import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import crypto from 'node:crypto';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(user.id);

  const unreadCount = (db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ? AND is_read = 0
  `).get(user.id) as any)?.count || 0;

  return NextResponse.json({ success: true, notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.id);
    } else if (notificationId) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(notificationId, user.id);
    }

    return NextResponse.json({ success: true, message: 'Notifications updated' });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Could not update notification state' }, { status: 500 });
  }
}

// Proactive deadline scanner
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const assignments = db.prepare(`
      SELECT a.*, s.name as subject_name, s.code as subject_code
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.user_id = ? AND a.status != 'COMPLETED'
    `).all(user.id) as any[];

    const now = new Date();
    let createdCount = 0;

    for (const a of assignments) {
      const dueDate = new Date(a.due_date);
      const diffMs = dueDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Check if alert already exists for this task in the last 12 hours
      const existingAlert = db.prepare(`
        SELECT id FROM notifications
        WHERE user_id = ? AND assignment_id = ? AND datetime(created_at) > datetime('now', '-12 hours')
      `).get(user.id, a.id);

      if (!existingAlert) {
        if (diffHours < 0) {
          // Overdue
          db.prepare(`
            INSERT INTO notifications (id, user_id, title, message, type, is_read, assignment_id)
            VALUES (?, ?, ?, ?, 'TASK_OVERDUE', 0, ?)
          `).run(
            'notif_' + crypto.randomUUID().slice(0, 8),
            user.id,
            `🚨 Deadline Passed: ${a.subject_code}`,
            `"${a.title}" is overdue! Please complete and submit to avoid penalty marks.`,
            a.id
          );
          createdCount++;
        } else if (diffHours <= 24) {
          // Less than 24 hours
          const hoursLeft = Math.max(1, Math.round(diffHours));
          db.prepare(`
            INSERT INTO notifications (id, user_id, title, message, type, is_read, assignment_id)
            VALUES (?, ?, ?, ?, 'DEADLINE_APPROACHING', 0, ?)
          `).run(
            'notif_' + crypto.randomUUID().slice(0, 8),
            user.id,
            `⏳ ${hoursLeft}h Left: ${a.subject_code}`,
            `Impending deadline for "${a.title}". Estimated time to finish: ${a.estimated_hours || 2} hours.`,
            a.id
          );
          createdCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      scannedCount: assignments.length,
      newAlertsCreated: createdCount,
    });
  } catch (error) {
    console.error('Notification scanner error:', error);
    return NextResponse.json({ error: 'Failed to scan deadlines' }, { status: 500 });
  }
}
