'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Assignment, Subject } from '@/lib/types';
import { BarChart3, CheckCircle2, Clock, Flame, Award } from 'lucide-react';

interface AnalyticsViewProps {
  assignments: Assignment[];
  subjects: Subject[];
}

export function AnalyticsView({ assignments, subjects }: AnalyticsViewProps) {
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
  const pending = assignments.filter((a) => a.status !== 'COMPLETED').length;
  const overdue = assignments.filter((a) => a.is_overdue).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalHours = assignments.reduce((acc, a) => acc + (a.estimated_hours || 2), 0);
  const completedHours = assignments
    .filter((a) => a.status === 'COMPLETED')
    .reduce((acc, a) => acc + (a.estimated_hours || 2), 0);

  // Subject workload distribution
  const subjectData = subjects.map((s) => {
    const subTasks = assignments.filter((a) => a.subject_id === s.id);
    const done = subTasks.filter((a) => a.status === 'COMPLETED').length;
    const active = subTasks.filter((a) => a.status !== 'COMPLETED').length;
    return {
      name: s.code,
      fullName: s.name,
      Completed: done,
      Pending: active,
      color: s.color,
    };
  });

  // Priority distribution
  const priorityCounts = {
    URGENT: assignments.filter((a) => a.priority === 'URGENT').length,
    HIGH: assignments.filter((a) => a.priority === 'HIGH').length,
    MEDIUM: assignments.filter((a) => a.priority === 'MEDIUM').length,
    LOW: assignments.filter((a) => a.priority === 'LOW').length,
  };

  const priorityData = [
    { name: 'Urgent', value: priorityCounts.URGENT, color: '#f43f5e' },
    { name: 'High', value: priorityCounts.HIGH, color: '#f59e0b' },
    { name: 'Medium', value: priorityCounts.MEDIUM, color: '#3b82f6' },
    { name: 'Low', value: priorityCounts.LOW, color: '#64748b' },
  ].filter((d) => d.value > 0);

  // Task type breakdown
  const typeData = [
    { name: 'Lab Records', value: assignments.filter((a) => a.task_type === 'LAB_RECORD').length, color: '#06b6d4' },
    { name: 'Assignments', value: assignments.filter((a) => a.task_type === 'ASSIGNMENT').length, color: '#3b82f6' },
    { name: 'Project Reports', value: assignments.filter((a) => a.task_type === 'PROJECT_REPORT').length, color: '#8b5cf6' },
    { name: 'Quiz Prep', value: assignments.filter((a) => a.task_type === 'QUIZ_PREP').length, color: '#f59e0b' },
    { name: 'Practice Sets', value: assignments.filter((a) => a.task_type === 'PRACTICE_PROBLEMS').length, color: '#10b981' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{completionRate}%</div>
            <div className="text-xs text-slate-400 font-medium">Completion Rate</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{pending}</div>
            <div className="text-xs text-slate-400 font-medium">Pending Deliverables</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{overdue}</div>
            <div className="text-xs text-slate-400 font-medium">Overdue Submissions</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{Math.round(completedHours)}h / {Math.round(totalHours)}h</div>
            <div className="text-xs text-slate-400 font-medium">Study Effort Logged</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Workload Bar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Workload by Course (Slide 4 & 5)
              </h3>
              <p className="text-xs text-slate-400">
                Completed vs Pending deliverables across academic subjects
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority & Type Distribution Pie Charts */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Task Breakdown & Priority Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Cognitive urgency and academic category distribution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-64">
            {/* Priority Pie */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 mb-1">By Priority</span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-[10px] text-slate-300">
                {priorityData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </div>

            {/* Task Type Pie */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 mb-1">By Academic Type</span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-[10px] text-slate-300">
                {typeData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
