import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'academic_tasks.db');

// Global singleton to preserve connection across HMR in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __academic_db: DatabaseSync | undefined;
}

function getDatabase(): DatabaseSync {
  if (global.__academic_db) {
    return global.__academic_db;
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  initSchema(db);
  seedIfEmpty(db);

  global.__academic_db = db;
  return db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      institution TEXT DEFAULT 'School of Computer Science & Engineering, B.Tech',
      semester TEXT DEFAULT '6th Semester',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      professor TEXT,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      credits INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      task_type TEXT NOT NULL DEFAULT 'ASSIGNMENT',
      due_date TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      status TEXT NOT NULL DEFAULT 'PENDING',
      submission_type TEXT NOT NULL DEFAULT 'ONLINE_PORTAL',
      submission_link TEXT,
      estimated_hours REAL DEFAULT 2.0,
      completed_at TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assignment_id TEXT NOT NULL,
      reminder_time TEXT NOT NULL,
      remind_before TEXT NOT NULL DEFAULT '24_HOURS',
      type TEXT NOT NULL DEFAULT 'NOTIFICATION_PUSH',
      is_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'DEADLINE_APPROACHING',
      is_read INTEGER NOT NULL DEFAULT 0,
      assignment_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export function seedDemoData(db: DatabaseSync) {
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const demoUserId = 'usr_demo_btech_student';

  // Clear existing demo data
  db.exec(`
    DELETE FROM notifications WHERE user_id = '${demoUserId}';
    DELETE FROM reminders WHERE user_id = '${demoUserId}';
    DELETE FROM assignments WHERE user_id = '${demoUserId}';
    DELETE FROM subjects WHERE user_id = '${demoUserId}';
    DELETE FROM users WHERE id = '${demoUserId}' OR email = 'demo@student.edu';
  `);

  // Insert Demo Student
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, institution, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    demoUserId,
    'Aarav Sharma',
    'demo@student.edu',
    hashedPassword,
    'STUDENT',
    'Department of Computer Science & Engineering (B.Tech)',
    '6th Semester — Section A'
  );

  // Insert Academic Subjects
  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, user_id, name, code, professor, color, credits)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const subjects = [
    { id: 'sub_dbms', name: 'Database Management Systems', code: 'CS601', professor: 'Dr. Ramesh Sharma', color: '#3b82f6', credits: 4 },
    { id: 'sub_compiler', name: 'Compiler Design', code: 'CS602', professor: 'Prof. Vineeta Nair', color: '#8b5cf6', credits: 4 },
    { id: 'sub_ml', name: 'Machine Learning & Deep Learning', code: 'CS603', professor: 'Dr. Sourav Banerjee', color: '#10b981', credits: 3 },
    { id: 'sub_cn', name: 'Computer Networks & Security', code: 'CS604', professor: 'Prof. Kunal Patel', color: '#f59e0b', credits: 4 },
    { id: 'sub_se', name: 'Software Engineering & Agile', code: 'CS605', professor: 'Dr. Maya Roy', color: '#f43f5e', credits: 3 },
  ];

  for (const s of subjects) {
    insertSubject.run(s.id, demoUserId, s.name, s.code, s.professor, s.color, s.credits);
  }

  // Calculate dynamic dates relative to current time so reminders are active
  const now = new Date();
  const formatIso = (date: Date) => date.toISOString();

  // 1. Due in 5 hours (Urgent lab record)
  const dueIn5Hours = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  // 2. Due in 22 hours (High priority assignment)
  const dueIn22Hours = new Date(now.getTime() + 22 * 60 * 60 * 1000);
  // 3. Due in 3 days (Compiler design AST)
  const dueIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  // 4. Due in 6 days (ML CNN mini-project)
  const dueIn6Days = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  // 5. Due in 10 days (Software Engineering SRS Doc)
  const dueIn10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  // 6. Overdue by 1 day (DBMS SQL triggers)
  const overdueBy1Day = new Date(now.getTime() - 26 * 60 * 60 * 1000);
  // 7. Completed 2 days ago (Wireshark packet capture lab)
  const completed2DaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  // 8. Completed 5 days ago (Compiler Lexical Analyzer)
  const completed5DaysAgo = new Date(now.getTime() - 120 * 60 * 60 * 1000);

  const insertAssignment = db.prepare(`
    INSERT INTO assignments (
      id, user_id, subject_id, title, description, task_type,
      due_date, priority, status, submission_type, submission_link,
      estimated_hours, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const assignments = [
    {
      id: 'asg_1',
      subjectId: 'sub_dbms',
      title: 'B+ Tree Indexing & Transaction Concurrency Control Lab',
      description: 'Implement two-phase locking (2PL) protocol simulation in C++/Java and write execution graphs for serializability testing.',
      taskType: 'LAB_RECORD',
      dueDate: formatIso(dueIn5Hours),
      priority: 'URGENT',
      status: 'PENDING',
      submissionType: 'HARD_COPY',
      submissionLink: 'Lab Room 304 submission box',
      estimatedHours: 3.5,
      completedAt: null,
    },
    {
      id: 'asg_2',
      subjectId: 'sub_compiler',
      title: 'LR(1) & LALR Parser Construction Assignment',
      description: 'Construct canonical collection of LR(1) items and parse table conflict resolution for arithmetic grammar specifications.',
      taskType: 'ASSIGNMENT',
      dueDate: formatIso(dueIn22Hours),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      submissionType: 'ONLINE_PORTAL',
      submissionLink: 'https://moodle.college.edu/course/view.php?id=CS602',
      estimatedHours: 4.0,
      completedAt: null,
    },
    {
      id: 'asg_3',
      subjectId: 'sub_ml',
      title: 'Deep Residual Network (ResNet-18) Image Classification',
      description: 'Train ResNet-18 on CIFAR-100 dataset using PyTorch. Include confusion matrix, precision/recall curves, and ablation study report.',
      taskType: 'PROJECT_REPORT',
      dueDate: formatIso(dueIn3Days),
      priority: 'HIGH',
      status: 'PENDING',
      submissionType: 'GITHUB_REPO',
      submissionLink: 'https://github.com/student-demo/resnet18-cifar',
      estimatedHours: 6.0,
      completedAt: null,
    },
    {
      id: 'asg_4',
      subjectId: 'sub_cn',
      title: 'TCP Congestion Control Algorithms Comparison & NS3 Sim',
      description: 'Simulate Reno vs Cubic vs BBR congestion control under varying packet drop probability in NS3 network simulator.',
      taskType: 'PRACTICE_PROBLEMS',
      dueDate: formatIso(dueIn6Days),
      priority: 'MEDIUM',
      status: 'PENDING',
      submissionType: 'ONLINE_PORTAL',
      submissionLink: 'https://classroom.google.com/c/CS604',
      estimatedHours: 2.5,
      completedAt: null,
    },
    {
      id: 'asg_5',
      subjectId: 'sub_se',
      title: 'Software Requirement Specification (SRS) IEEE 830 Document',
      description: 'Complete comprehensive SRS document with Use Case Diagrams, Class diagrams, Sequence diagrams, and Non-functional specifications.',
      taskType: 'PROJECT_REPORT',
      dueDate: formatIso(dueIn10Days),
      priority: 'MEDIUM',
      status: 'PENDING',
      submissionType: 'EMAIL',
      submissionLink: 'dr.mayaroy@college.edu',
      estimatedHours: 5.0,
      completedAt: null,
    },
    {
      id: 'asg_6',
      subjectId: 'sub_dbms',
      title: 'Complex SQL Triggers & Stored Procedures Quiz Prep',
      description: 'Prepare problem sets for upcoming internal assessment on recursive queries, row-level security, and audit trigger triggers.',
      taskType: 'QUIZ_PREP',
      dueDate: formatIso(overdueBy1Day),
      priority: 'HIGH',
      status: 'OVERDUE',
      submissionType: 'ONLINE_PORTAL',
      submissionLink: 'https://portal.university.edu/quizzes/cs601',
      estimatedHours: 2.0,
      completedAt: null,
    },
    {
      id: 'asg_7',
      subjectId: 'sub_cn',
      title: 'Wireshark Packet Analysis & DNS Protocol Inspection Lab',
      description: 'Captured and dissected live HTTP/HTTPS handshake, DNS recursive lookups, and ARP request broadcasts.',
      taskType: 'LAB_RECORD',
      dueDate: formatIso(completed2DaysAgo),
      priority: 'MEDIUM',
      status: 'COMPLETED',
      submissionType: 'HARD_COPY',
      submissionLink: 'Verified & Signed by Prof. K. Patel',
      estimatedHours: 3.0,
      completedAt: formatIso(completed2DaysAgo),
    },
    {
      id: 'asg_8',
      subjectId: 'sub_compiler',
      title: 'Lexical Analyzer implementation using Flex (C++)',
      description: 'Tokenized C-like language keywords, identifiers, floating point numbers, and multi-line nested comments.',
      taskType: 'ASSIGNMENT',
      dueDate: formatIso(completed5DaysAgo),
      priority: 'MEDIUM',
      status: 'COMPLETED',
      submissionType: 'GITHUB_REPO',
      submissionLink: 'https://github.com/student-demo/flex-lexer',
      estimatedHours: 3.5,
      completedAt: formatIso(completed5DaysAgo),
    },
  ];

  for (const a of assignments) {
    insertAssignment.run(
      a.id,
      demoUserId,
      a.subjectId,
      a.title,
      a.description,
      a.taskType,
      a.dueDate,
      a.priority,
      a.status,
      a.submissionType,
      a.submissionLink,
      a.estimatedHours,
      a.completedAt
    );
  }

  // Insert Initial Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, assignment_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    'notif_1',
    demoUserId,
    '⚠️ Urgent Deadline Approaching',
    'CS601: "B+ Tree Indexing & Transaction Concurrency Control Lab" is due in less than 5 hours!',
    'DEADLINE_APPROACHING',
    0,
    'asg_1',
    formatIso(now)
  );

  insertNotification.run(
    'notif_2',
    demoUserId,
    '📌 Assignment Reminder (Due Tomorrow)',
    'CS602: "LR(1) & LALR Parser Construction" is scheduled for submission in 22 hours.',
    'DEADLINE_APPROACHING',
    0,
    'asg_2',
    formatIso(new Date(now.getTime() - 2 * 60 * 60 * 1000))
  );

  insertNotification.run(
    'notif_3',
    demoUserId,
    '🚨 Overdue Task Alert',
    'CS601: "Complex SQL Triggers & Stored Procedures Quiz Prep" submission deadline has lapsed.',
    'TASK_OVERDUE',
    0,
    'asg_6',
    formatIso(new Date(now.getTime() - 4 * 60 * 60 * 1000))
  );

  insertNotification.run(
    'notif_4',
    demoUserId,
    '🎉 Task Finalized',
    'Great job! "Wireshark Packet Analysis Lab" has been moved to Successfully Finalized archive.',
    'TASK_COMPLETED',
    1,
    'asg_7',
    formatIso(completed2DaysAgo)
  );
}

function seedIfEmpty(db: DatabaseSync) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDemoData(db);
  }
}

export const db = getDatabase();
