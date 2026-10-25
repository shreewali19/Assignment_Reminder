'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  FlaskConical,
  FolderGit2,
  HelpCircle,
  Bookmark,
  Calendar,
  Send
} from 'lucide-react';
import { Assignment } from '@/lib/types';
import confetti from 'canvas-confetti';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: string) => void;
}

export function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
  onToggleStatus,
}: AssignmentCardProps) {
  const isCompleted = assignment.status === 'COMPLETED';
  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = !isCompleted && diffMs < 0;

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Confetti fallback
      }
      onToggleStatus(assignment.id, 'COMPLETED');
    } else {
      onToggleStatus(assignment.id, 'PENDING');
    }
  };

  const getTaskIcon = () => {
    switch (assignment.task_type) {
      case 'LAB_RECORD':
        return <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />;
      case 'PROJECT_REPORT':
        return <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'QUIZ_PREP':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'PRACTICE_PROBLEMS':
        return <Bookmark className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getPriorityBadge = () => {
    switch (assignment.priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">LOW</span>;
    }
  };

  const getCountdownString = () => {
    if (isCompleted) {
      return `Finalized ${assignment.completed_at ? new Date(assignment.completed_at).toLocaleDateString() : ''}`;
    }
    if (isOverdue) {
      const days = Math.abs(diffDays);
      return days === 0 ? `Overdue by ${Math.abs(diffHours)}h` : `Overdue by ${days}d`;
    }
    if (diffHours < 24) {
      return `Due in ${Math.max(1, diffHours)}h`;
    }
    if (diffDays === 1) {
      return 'Due Tomorrow';
    }
    return `Due in ${diffDays} days`;
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all p-5 flex flex-col justify-between ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/80 opacity-80 hover:opacity-100'
          : isOverdue
          ? 'bg-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:shadow-xl'
      }`}
    >
      <div>
        {/* Top Header: Course Pill & Priority & Countdown */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{
                backgroundColor: `${assignment.subject_color}20`,
                color: assignment.subject_color,
                border: `1px solid ${assignment.subject_color}40`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: assignment.subject_color }}
              />
              {assignment.subject_code}
            </span>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300">
              {getTaskIcon()}
              <span>{assignment.task_type.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getPriorityBadge()}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-sm sm:text-base font-bold tracking-tight mb-2 ${
            isCompleted ? 'line-through text-slate-400' : 'text-white group-hover:text-blue-300 transition-colors'
          }`}
        >
          {assignment.title}
        </h3>

        {/* Course name */}
        <p className="text-xs text-slate-400 font-medium mb-2.5">
          {assignment.subject_name} {assignment.subject_professor ? `• ${assignment.subject_professor}` : ''}
        </p>

        {/* Description */}
        {assignment.description && (
          <p className="text-xs text-slate-400/90 line-clamp-2 leading-relaxed mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 font-mono text-[11px]">
            {assignment.description}
          </p>
        )}
      </div>

      <div>
        {/* Submission & Time Meta */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs mb-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {dueDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300'
                : isOverdue
                ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                : diffHours < 24
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            {getCountdownString()}
          </span>
        </div>

        {/* Submission mode badge */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-3 bg-slate-800/40 px-2.5 py-1.5 rounded-lg">
          <span className="flex items-center gap-1">
            <Send className="w-3 h-3 text-indigo-400" />
            <span>Mode: {assignment.submission_type.replace('_', ' ')}</span>
          </span>
          {assignment.submission_link && (
            <span className="text-slate-400 truncate max-w-[140px] text-[10px]" title={assignment.submission_link}>
              {assignment.submission_link}
            </span>
          )}
          {assignment.estimated_hours && (
            <span className="text-slate-500">~{assignment.estimated_hours}h work</span>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleMarkComplete}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Mark Pending' : 'Mark Complete'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(assignment)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(assignment.id)}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
