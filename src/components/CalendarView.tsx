'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { Assignment } from '@/lib/types';

interface CalendarViewProps {
  assignments: Assignment[];
  onSelectTask: (assignment: Assignment) => void;
  onAddTaskOnDate?: (date: Date) => void;
}

export function CalendarView({ assignments, onSelectTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build grid cells
  const calendarCells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Previous month overflow days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      date: new Date(year, month - 1, d),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month overflow days to complete 35 or 42 cells
  const totalCells = Math.ceil(calendarCells.length / 7) * 7;
  const remaining = totalCells - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive academic deadlines schedule and submission calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarCells.map((cell, idx) => {
          const isToday =
            isCurrentMonth &&
            cell.isCurrentMonth &&
            cell.day === today.getDate();

          // Find assignments due on this day
          const dayAssignments = assignments.filter((a) => {
            const d = new Date(a.due_date);
            return (
              d.getFullYear() === cell.date.getFullYear() &&
              d.getMonth() === cell.date.getMonth() &&
              d.getDate() === cell.date.getDate()
            );
          });

          return (
            <div
              key={idx}
              className={`min-h-[90px] sm:min-h-[115px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                cell.isCurrentMonth
                  ? isToday
                    ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-900/50 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  {cell.day}
                </span>

                {dayAssignments.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {dayAssignments.length}
                  </span>
                )}
              </div>

              {/* Tasks list inside day */}
              <div className="space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
                {dayAssignments.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-1 rounded-lg text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-1"
                    style={{
                      backgroundColor: `${task.subject_color}25`,
                      color: task.subject_color,
                      border: `1px solid ${task.subject_color}40`,
                    }}
                    title={`${task.subject_code}: ${task.title}`}
                  >
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: task.subject_color }}
                      />
                    )}
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {dayAssignments.length > 3 && (
                  <div className="text-[9px] text-slate-500 text-center font-bold">
                    +{dayAssignments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
