'use client';

import React from 'react';
import { LogIn, LayoutDashboard, PlusCircle, Database, BellRing, CheckCircle, ArrowRight } from 'lucide-react';

interface WorkflowBannerProps {
  onAddTask: () => void;
  activeTasksCount: number;
}

export function WorkflowBanner({ onAddTask, activeTasksCount }: WorkflowBannerProps) {
  const steps = [
    {
      title: 'Student Login',
      description: 'Secure JWT Auth Session',
      icon: LogIn,
      active: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Dashboard',
      description: 'Centralized Metrics & Dual Tracking',
      icon: LayoutDashboard,
      active: true,
      color: 'from-cyan-500 to-teal-500',
    },
    {
      title: 'Add Task',
      description: 'Categorized by Course & Lab',
      icon: PlusCircle,
      active: true,
      action: onAddTask,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      title: 'Cloud DB',
      description: 'Persistent Schema & Relational Storage',
      icon: Database,
      active: true,
      color: 'from-emerald-500 to-indigo-500',
    },
    {
      title: 'Notification',
      description: 'Proactive Push & In-App Alerts',
      icon: BellRing,
      active: true,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Complete',
      description: 'Dual-Tracking Finalized Archive',
      icon: CheckCircle,
      active: true,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Slide 6 & 7: System Architecture
            </span>
            <span className="text-xs text-slate-400">End-to-End User Data Lifecycle</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Automated Academic Workflow Pipeline
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Academic Task</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Flow Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              onClick={step.action}
              className={`group relative p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-all flex flex-col justify-between ${
                step.action ? 'cursor-pointer hover:border-indigo-500/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-400 transition-colors">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white tracking-tight flex items-center justify-between">
                  <span>{step.title}</span>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600 hidden lg:block group-hover:text-indigo-400 transition-colors" />
                  )}
                </h3>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
