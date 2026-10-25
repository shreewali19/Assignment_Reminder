'use client';

import React, { useState } from 'react';
import {
  X,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ProjectShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectShowcaseModal({ isOpen, onClose }: ProjectShowcaseModalProps) {
  const [activeSlide, setActiveSlide] = useState(1);

  if (!isOpen) return null;

  const slides = [
    {
      num: 1,
      title: 'Title & Cover',
      subtitle: 'B.Tech Engineering Project Presentation',
      badge: 'B.Tech Minor Project',
      content: (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-4">
            <Presentation className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Assignment Reminder App</h3>
          <p className="text-sm text-blue-200 mt-2 max-w-lg mx-auto">
            An intelligent mobile and web solution designed to streamline academic submissions, eradicate late deadlines, and elevate student productivity.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
            🎓 B.Tech Engineering Project Presentation
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: '1. Introduction',
      subtitle: 'Project Overview & Core Purpose',
      badge: 'Section 1',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">ℹ️ Project Overview</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Assignment Reminder App is a robust cross-platform mobile and web utility built to help students systematically organize, track, and submit academic coursework without missing strict submission timelines.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">🎯 Core Purpose</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              With multiple subjects and overlapping schedules, students frequently lose track of deadlines. This application bridges the gap by acting as an automated digital secretary for all academic deliverables.
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 3,
      title: '2. Problem Statement',
      subtitle: 'Challenges Identified in Academic Environments',
      badge: 'Section 2',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="text-xs font-bold text-rose-400 mb-1.5">🧠 Memory Reliance</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Students routinely depend on fragile mental memory or misplaced handwritten notes to track assignments, resulting in frequent oversights.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="text-xs font-bold text-amber-400 mb-1.5">⚠️ Fragmented Systems</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              The complete lack of a consolidated, automated alert mechanism means crucial deadlines pass unnoticed until penalty marks are incurred.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h4 className="text-xs font-bold text-purple-400 mb-1.5">📊 Organizational Chaos</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Managing diverse multi-subject projects without a centralized platform introduces immense stress and reduces overall academic performance.
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: '3. Existing System & Limitations',
      subtitle: 'Comparison with Manual Academic Methods',
      badge: 'Section 3',
      content: (
        <div className="space-y-2.5 py-1">
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Traditional Mediums:</strong> Reliance on paper notebooks, physical diaries, and static wall calendars that lack proactive notification features.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Manual Interventions:</strong> Mobile phone alarms and calendar entries must be manually configured for each specific task and subject.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Multi-Subject Friction:</strong> Highly cumbersome to manage assignments across various concurrent college courses without structural categorization.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs flex items-start gap-2.5">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <div>
              <strong className="text-white">Zero Tracking Analytics:</strong> Absence of a unified dashboard to differentiate completed tasks from pending deliverables at a single glance.
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 5,
      title: '4. Objective of Proposed System',
      subtitle: 'Engineered Solutions Implemented in App',
      badge: 'Section 4',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
            <strong className="text-emerald-300 block mb-1">✓ Proactive Reminders:</strong>
            <p className="text-slate-300">Deliver timely, automated push notifications before impending assignment deadlines.</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs">
            <strong className="text-blue-300 block mb-1">✓ Subject Categorization:</strong>
            <p className="text-slate-300">Cleanly structure and filter assignments according to academic courses and departments.</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
            <strong className="text-indigo-300 block mb-1">✓ Efficiency & Punctuality:</strong>
            <p className="text-slate-300">Drastically minimize late submissions and academic penalties through systematic time management.</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
            <strong className="text-purple-300 block mb-1">✓ Intuitive UI/UX:</strong>
            <p className="text-slate-300">Offer a seamless, friction-free interface accessible to students across mobile and desktop devices.</p>
          </div>
        </div>
      ),
    },
    {
      num: 6,
      title: '5. Technology Stack Requirements',
      subtitle: 'Software Specifications & Architecture',
      badge: 'Section 5',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" /> Software Stack
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, Recharts, Lucide</li>
              <li><strong>Backend:</strong> Next.js Full-Stack RESTful API Routes</li>
              <li><strong>Database:</strong> Native SQLite / Relational Schema with Foreign Keys & WAL</li>
              <li><strong>Security:</strong> JWT Auth, Bcrypt Password Hashing, HTTP-only Cookies</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" /> Hardware Specifications
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><strong>Processor:</strong> Intel Core i3 or higher equivalent</li>
              <li><strong>Memory:</strong> Minimum 4 GB RAM</li>
              <li><strong>Storage:</strong> 10 GB Free Storage Space</li>
              <li><strong>Devices:</strong> Laptop/Desktop & Android Smartphone</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      num: 7,
      title: '6. System Workflow & Architecture',
      subtitle: 'End-to-End User Data Lifecycle',
      badge: 'Section 6',
      content: (
        <div className="py-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 border border-indigo-500/30">
            <h4 className="text-center text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">
              End-to-End User Data Lifecycle Flow
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold shadow">Student Login</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1.5 bg-cyan-600 text-white rounded-xl font-bold shadow">Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1.5 bg-teal-600 text-white rounded-xl font-bold shadow">Add Task</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold shadow">Cloud DB</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1.5 bg-purple-600 text-white rounded-xl font-bold shadow">Notification</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow">Complete</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 8,
      title: '7. Unique Selling Proposition (USP)',
      subtitle: 'Core Differentiators of the Solution',
      badge: 'Section 7',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30">
            <h4 className="text-xs font-bold text-blue-300 mb-1">🔔 Smart Notifications</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Automated reminders triggered dynamically based on approaching deadlines and task priority levels.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
            <h4 className="text-xs font-bold text-indigo-300 mb-1">📑 Dual Tracking</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Effortlessly differentiate between pending requirements and successfully finalized academic assignments.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
            <h4 className="text-xs font-bold text-purple-300 mb-1">⚡ Productivity Boost</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Designed to minimize cognitive load, save valuable study hours, and eliminate missed submissions entirely.
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 9,
      title: '8. Target Applications & Users',
      subtitle: 'Academic Audience & Specific Deliverable Benefits',
      badge: 'Section 8',
      content: (
        <div className="space-y-2 py-1">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300">Engineering Colleges (B.Tech / Diploma)</span>
            <span className="text-slate-300 text-[11px]">Manage complex lab records, technical reports, and project submissions.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300">Schools & Universities</span>
            <span className="text-slate-300 text-[11px]">Organize semester homework, essays, and internal test schedules.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300">Coaching Institutes</span>
            <span className="text-slate-300 text-[11px]">Track daily practice problem sets and test deliverables.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-300">Online Learning Platforms</span>
            <span className="text-slate-300 text-[11px]">Keep pace with modular course deadlines and certificate milestones.</span>
          </div>
        </div>
      ),
    },
    {
      num: 10,
      title: '10. Future Scope & System Limitations',
      subtitle: 'Roadmap & Real-World System Boundaries',
      badge: 'Section 10',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs">
            <h4 className="font-bold text-purple-300 mb-2">🔮 Future Enhancements</h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>AI-powered smart scheduling suggestions.</li>
              <li>Voice assistant integration (Google/Alexa).</li>
              <li>Teacher portal for direct task broadcasting.</li>
              <li>Comprehensive calendar sync features (.ics).</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-xs">
            <h4 className="font-bold text-rose-300 mb-2">⚠️ Known Limitations</h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>Requires active internet for real-time cloud sync.</li>
              <li>Depends on accurate student input data.</li>
              <li>Notifications fail if device permissions are revoked.</li>
              <li>Restricted functionality in strict offline mode.</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const current = slides.find((s) => s.num === activeSlide) || slides[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Project Defense & Presentation Reference
              </h2>
              <p className="text-xs text-slate-400">
                Interactive slide inspector mapping directly to the B.Tech Minor Project Presentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-800/80 scrollbar-none">
          {slides.map((s) => (
            <button
              key={s.num}
              onClick={() => setActiveSlide(s.num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeSlide === s.num
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/70 hover:bg-slate-700/70 text-slate-400 hover:text-white'
              }`}
            >
              Slide {s.num}
            </button>
          ))}
        </div>

        {/* Slide Display Area */}
        <div className="my-5 p-6 rounded-3xl bg-slate-950/70 border border-slate-800 min-h-[260px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {current.badge}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Slide {current.num} of 10
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{current.title}</h3>
            <p className="text-xs text-slate-400 mb-4">{current.subtitle}</p>

            {current.content}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setActiveSlide((prev) => Math.max(1, prev - 1))}
            disabled={activeSlide === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            ← Previous Slide
          </button>

          <span className="text-xs text-slate-500">Use arrow buttons to navigate slides</span>

          <button
            onClick={() => setActiveSlide((prev) => Math.min(10, prev + 1))}
            disabled={activeSlide === 10}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-40"
          >
            Next Slide →
          </button>
        </div>
      </div>
    </div>
  );
}
