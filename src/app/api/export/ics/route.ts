import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

function formatDateToICS(isoString: string): string {
  const d = new Date(isoString);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assignments = db.prepare(`
    SELECT a.*, s.name as subject_name, s.code as subject_code
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.user_id = ?
    ORDER BY a.due_date ASC
  `).all(user.id) as any[];

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Assignment Reminder App//Smart Academic Task Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Academic Deliverables & Deadlines',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const a of assignments) {
    const dtStamp = formatDateToICS(a.created_at || new Date().toISOString());
    const dtDue = formatDateToICS(a.due_date);
    const summary = `[${a.subject_code}] ${a.title.replace(/[\r\n]/g, ' ')}`;
    const description = `Subject: ${a.subject_name}\\nTask Type: ${a.task_type}\\nPriority: ${a.priority}\\nStatus: ${a.status}\\nSubmission: ${a.submission_type}${a.submission_link ? ' (' + a.submission_link + ')' : ''}\\n\\n${(a.description || '').replace(/[\r\n]/g, '\\n')}`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${a.id}@academic-reminder.edu`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtDue}`,
      `DTEND:${dtDue}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `PRIORITY:${a.priority === 'URGENT' ? '1' : a.priority === 'HIGH' ? '3' : '5'}`,
      `STATUS:${a.status === 'COMPLETED' ? 'CONFIRMED' : 'NEEDS-ACTION'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${summary} is due in 24 hours`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  ics.push('END:VCALENDAR');

  const fileContent = ics.join('\r\n');

  return new NextResponse(fileContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="academic-deadlines.ics"',
    },
  });
}
