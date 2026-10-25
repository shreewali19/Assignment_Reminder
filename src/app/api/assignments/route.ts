import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import crypto from 'node:crypto';

const assignmentSchema = z.object({
  subjectId: z.string().min(1, 'Please select an academic subject'),
  title: z.string().min(3, 'Assignment title is required (min 3 chars)'),
  description: z.string().optional(),
  taskType: z.enum(['ASSIGNMENT', 'LAB_RECORD', 'PROJECT_REPORT', 'QUIZ_PREP', 'PRACTICE_PROBLEMS']).default('ASSIGNMENT'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).default('PENDING'),
  submissionType: z.enum(['ONLINE_PORTAL', 'HARD_COPY', 'GITHUB_REPO', 'EMAIL']).default('ONLINE_PORTAL'),
  submissionLink: z.string().optional(),
  estimatedHours: z.number().min(0.5).max(100).default(2.0),
  remindBefore: z.enum(['1_HOUR', '3_HOURS', '24_HOURS', '48_HOURS']).default('24_HOURS'),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const subjectId = url.searchParams.get('subjectId');
  const status = url.searchParams.get('status'); // 'PENDING_GROUP', 'COMPLETED', 'ALL', 'OVERDUE'
  const priority = url.searchParams.get('priority');
  const taskType = url.searchParams.get('taskType');
  const sortBy = url.searchParams.get('sortBy') || 'due_date_asc';

  let query = `
    SELECT
      a.*,
      s.name as subject_name,
      s.code as subject_code,
      s.color as subject_color,
      s.professor as subject_professor
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.user_id = ?
  `;
  const params: any[] = [user.id];

  if (search.trim()) {
    query += ` AND (a.title LIKE ? OR a.description LIKE ? OR s.name LIKE ? OR s.code LIKE ?)`;
    const pattern = `%${search.trim()}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  if (subjectId && subjectId !== 'ALL') {
    query += ` AND a.subject_id = ?`;
    params.push(subjectId);
  }

  if (priority && priority !== 'ALL') {
    query += ` AND a.priority = ?`;
    params.push(priority);
  }

  if (taskType && taskType !== 'ALL') {
    query += ` AND a.task_type = ?`;
    params.push(taskType);
  }

  if (status) {
    if (status === 'PENDING_GROUP') {
      // Dual tracking USP: all active/pending deliverables
      query += ` AND a.status != 'COMPLETED'`;
    } else if (status === 'COMPLETED') {
      // Dual tracking USP: finalized archive
      query += ` AND a.status = 'COMPLETED'`;
    } else if (status !== 'ALL') {
      query += ` AND a.status = ?`;
      params.push(status);
    }
  }

  // Sorting
  if (sortBy === 'due_date_asc') {
    query += ` ORDER BY a.due_date ASC`;
  } else if (sortBy === 'due_date_desc') {
    query += ` ORDER BY a.due_date DESC`;
  } else if (sortBy === 'priority') {
    query += ` ORDER BY CASE a.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 ELSE 5 END`;
  } else if (sortBy === 'title') {
    query += ` ORDER BY a.title ASC`;
  } else {
    query += ` ORDER BY a.due_date ASC`;
  }

  const assignments = db.prepare(query).all(...params);

  // Auto-flag overdue tasks that haven't been completed yet
  const now = new Date();
  const processed = assignments.map((asg: any) => {
    const isPastDue = asg.status !== 'COMPLETED' && new Date(asg.due_date) < now;
    return {
      ...asg,
      is_overdue: isPastDue,
    };
  });

  return NextResponse.json({ success: true, assignments: processed });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = assignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // Verify subject ownership
    const subject = db.prepare('SELECT id, name, code FROM subjects WHERE id = ? AND user_id = ?').get(data.subjectId, user.id) as any;
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found or does not belong to you' }, { status: 404 });
    }

    const assignmentId = 'asg_' + crypto.randomUUID().slice(0, 10);
    const dueDateIso = new Date(data.dueDate).toISOString();

    const insert = db.prepare(`
      INSERT INTO assignments (
        id, user_id, subject_id, title, description, task_type,
        due_date, priority, status, submission_type, submission_link,
        estimated_hours, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      assignmentId,
      user.id,
      data.subjectId,
      data.title,
      data.description || null,
      data.taskType,
      dueDateIso,
      data.priority,
      data.status,
      data.submissionType,
      data.submissionLink || null,
      data.estimatedHours,
      data.status === 'COMPLETED' ? new Date().toISOString() : null
    );

    // Schedule automated reminder
    const dueDate = new Date(dueDateIso);
    let reminderOffsetMs = 24 * 60 * 60 * 1000;
    if (data.remindBefore === '1_HOUR') reminderOffsetMs = 1 * 60 * 60 * 1000;
    else if (data.remindBefore === '3_HOURS') reminderOffsetMs = 3 * 60 * 60 * 1000;
    else if (data.remindBefore === '48_HOURS') reminderOffsetMs = 48 * 60 * 60 * 1000;

    const reminderTime = new Date(dueDate.getTime() - reminderOffsetMs).toISOString();

    db.prepare(`
      INSERT INTO reminders (id, user_id, assignment_id, reminder_time, remind_before, type, is_sent)
      VALUES (?, ?, ?, ?, ?, 'NOTIFICATION_PUSH', 0)
    `).run('rem_' + crypto.randomUUID().slice(0, 8), user.id, assignmentId, reminderTime, data.remindBefore);

    // Create an initial confirmation notification
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, assignment_id)
      VALUES (?, ?, ?, ?, 'DEADLINE_APPROACHING', 0, ?)
    `).run(
      'notif_' + crypto.randomUUID().slice(0, 8),
      user.id,
      `📌 New Task Created: ${subject.code}`,
      `"${data.title}" scheduled. Automated reminder set for ${data.remindBefore.replace('_', ' ').toLowerCase()} before deadline.`,
      assignmentId
    );

    const created = db.prepare(`
      SELECT a.*, s.name as subject_name, s.code as subject_code, s.color as subject_color
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.id = ?
    `).get(assignmentId);

    return NextResponse.json({ success: true, assignment: created }, { status: 201 });
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json({ error: 'Could not create assignment' }, { status: 500 });
  }
}
