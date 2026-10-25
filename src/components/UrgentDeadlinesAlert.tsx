'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';
import { Assignment } from '@/lib/types';

interface UrgentDeadlinesAlertProps {
  assignments: Assignment[];
  onSelectTask: (assignment: Assignment) => void;
  onScanNow: () => void;
}

export function UrgentDeadlinesAlert({ assignments, onSelectTask, onScanNow }: UrgentDeadlinesAlertProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000); // refresh every minute
    return () => clearInterval(timer);
  }, []);

  // Filter urgent deliverables due within 36 hours or overdue
  const urgentTasks = assignments.filter((a) => {
    if (a.status === 'COMPLETED') return false;
    const diffHours = (new Date(a.due_date).getTime() - currentTime) / (1000 * 60 * 60);
    return diffHours <= 36;
  });

  if (urgentTasks.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/50 border border-rose-500/30 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Proactive Deadline Alert Engine (USP Slide 8)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {urgentTasks.length} Impending
              </span>
            </div>
            <p className="text-xs text-rose-200/80">
              Deliverables requiring immediate attention before submission windows close
            </p>
          </div>
        </div>

        <button
          onClick={onScanNow}
          className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          Rescan Deadlines
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {urgentTasks.map((task) => {
          const diffMs = new Date(task.due_date).getTime() - currentTime;
          const diffHours = Math.round(diffMs / (1000 * 60 * 60));
          const isOverdue = diffMs < 0;

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="group p-3 rounded-xl bg-slate-900/90 border border-rose-500/20 hover:border-rose-400/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
                    style={{ backgroundColor: `${task.subject_color}25`, color: task.subject_color }}
                  >
                    {task.subject_code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      isOverdue ? 'text-rose-400 font-extrabold' : 'text-amber-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {isOverdue ? `Overdue by ${Math.abs(diffHours)}h` : `Due in ${diffHours}h`}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-rose-300 transition-colors">
                  {task.title}
                </h4>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{task.task_type.replace('_', ' ')}</span>
                <span className="flex items-center gap-0.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  View & Submit <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
