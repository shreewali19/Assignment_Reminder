import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const activeAssignments = db.prepare(`
    SELECT a.*, s.name as subject_name, s.code as subject_code
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.user_id = ? AND a.status != 'COMPLETED'
    ORDER BY
      CASE a.priority
        WHEN 'URGENT' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
      END,
      a.due_date ASC
  `).all(user.id) as any[];

  if (activeAssignments.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'All assignments are finalized! No urgent study blocks needed.',
      schedule: [],
    });
  }

  // Generate intelligent study breakdown blocks
  const now = new Date();
  const schedule: any[] = [];
  let blockStart = new Date(now.getTime() + 30 * 60 * 1000); // starts in 30 mins

  activeAssignments.slice(0, 4).forEach((asg, index) => {
    const estHours = asg.estimated_hours || 2;
    const sessionMins = Math.min(90, Math.max(45, Math.round(estHours * 30)));
    const blockEnd = new Date(blockStart.getTime() + sessionMins * 60 * 1000);

    schedule.push({
      blockId: `block_${index + 1}`,
      assignmentId: asg.id,
      title: asg.title,
      subjectCode: asg.subject_code,
      subjectName: asg.subject_name,
      priority: asg.priority,
      startTime: blockStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: blockEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMins: sessionMins,
      recommendationReason:
        asg.priority === 'URGENT'
          ? 'Urgent submission deadline approaching — highest cognitive focus recommended.'
          : asg.priority === 'HIGH'
          ? 'High-weightage deliverable requiring structured milestone progress.'
          : 'Consistent progress block to prevent deadline rush.',
    });

    // 15 min rest interval
    blockStart = new Date(blockEnd.getTime() + 15 * 60 * 1000);
  });

  return NextResponse.json({
    success: true,
    totalPlannedMinutes: schedule.reduce((sum, b) => sum + b.durationMins, 0),
    schedule,
  });
}
