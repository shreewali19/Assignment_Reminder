export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string;
  professor?: string | null;
  color: string;
  credits: number;
  created_at: string;
  total_tasks?: number;
  completed_tasks?: number;
  active_tasks?: number;
}

export type TaskType = 'ASSIGNMENT' | 'LAB_RECORD' | 'PROJECT_REPORT' | 'QUIZ_PREP' | 'PRACTICE_PROBLEMS';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type SubmissionType = 'ONLINE_PORTAL' | 'HARD_COPY' | 'GITHUB_REPO' | 'EMAIL';

export interface Assignment {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  task_type: TaskType;
  due_date: string;
  priority: Priority;
  status: Status;
  submission_type: SubmissionType;
  submission_link?: string | null;
  estimated_hours?: number;
  completed_at?: string | null;
  is_archived?: number;
  created_at: string;
  subject_name: string;
  subject_code: string;
  subject_color: string;
  subject_professor?: string | null;
  is_overdue?: boolean;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'DEADLINE_APPROACHING' | 'TASK_OVERDUE' | 'TASK_COMPLETED' | 'SYSTEM_ANNOUNCEMENT';
  is_read: number;
  assignment_id?: string | null;
  created_at: string;
}

export interface UserStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  subjectsCount: number;
  unreadNotifs: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string | null;
  semester: string | null;
}
