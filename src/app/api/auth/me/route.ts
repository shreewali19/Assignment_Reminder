import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Calculate live stats for the student
  const stats = db.prepare(`
    SELECT
      COUNT(*) as totalAssignments,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pendingCount,
      SUM(CASE WHEN status = 'OVERDUE' OR (status != 'COMPLETED' AND due_date < datetime('now')) THEN 1 ELSE 0 END) as overdueCount
    FROM assignments
    WHERE user_id = ?
  `).get(user.id) as any;

  const subjectsCount = (db.prepare('SELECT COUNT(*) as count FROM subjects WHERE user_id = ?').get(user.id) as any)?.count || 0;
  const unreadNotifs = (db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(user.id) as any)?.count || 0;

  return NextResponse.json({
    authenticated: true,
    user,
    stats: {
      total: stats?.totalAssignments || 0,
      completed: stats?.completedCount || 0,
      inProgress: stats?.inProgressCount || 0,
      pending: stats?.pendingCount || 0,
      overdue: stats?.overdueCount || 0,
      subjectsCount,
      unreadNotifs,
    },
  });
}
