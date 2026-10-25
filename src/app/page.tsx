'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Download,
  Presentation,
  CheckCircle2,
  Clock,
  Layers,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Calendar,
  RefreshCw,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { WorkflowBanner } from '@/components/WorkflowBanner';
import { UrgentDeadlinesAlert } from '@/components/UrgentDeadlinesAlert';
import { TargetAudienceSelector, TargetCategory } from '@/components/TargetAudienceSelector';
import { DualTrackingTabs, ActiveTab } from '@/components/DualTrackingTabs';
import { AssignmentCard } from '@/components/AssignmentCard';
import { TaskModal } from '@/components/TaskModal';
import { SubjectModal } from '@/components/SubjectModal';
import { AISchedulerModal } from '@/components/AISchedulerModal';
import { ProjectShowcaseModal } from '@/components/ProjectShowcaseModal';
import { CalendarView } from '@/components/CalendarView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { Assignment, Subject, AuthUser, UserStats } from '@/lib/types';
import { sendBrowserPushNotification } from '@/lib/notifications';

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Data states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('PENDING');
  const [targetCategory, setTargetCategory] = useState<TargetCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('due_date_asc');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Assignment | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isAISchedulerOpen, setIsAISchedulerOpen] = useState(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Auth Form Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authInstitution, setAuthInstitution] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Load Auth Session
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setStats(data.stats);
      } else {
        setUser(null);
        setStats(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  // Fetch Subjects & Assignments
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // 1. Fetch Subjects
      const subRes = await fetch('/api/subjects');
      const subData = await subRes.json();
      if (subData.success) {
        setSubjects(subData.subjects || []);
      }

      // 2. Fetch Assignments
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSubjectId !== 'ALL') params.append('subjectId', selectedSubjectId);
      if (selectedPriority !== 'ALL') params.append('priority', selectedPriority);
      if (sortBy) params.append('sortBy', sortBy);

      // Target category filtering (Slide 9)
      if (targetCategory === 'ENGINEERING') {
        params.append('taskType', 'LAB_RECORD');
      } else if (targetCategory === 'COACHING') {
        params.append('taskType', 'PRACTICE_PROBLEMS');
      } else if (targetCategory === 'UNIVERSITY') {
        params.append('taskType', 'ASSIGNMENT');
      } else if (targetCategory === 'ONLINE') {
        params.append('taskType', 'PROJECT_REPORT');
      }

      // Dual-tracking status filter
      if (activeTab === 'PENDING') {
        params.append('status', 'PENDING_GROUP');
      } else if (activeTab === 'FINALIZED') {
        params.append('status', 'COMPLETED');
      } else {
        params.append('status', 'ALL');
      }

      const asgRes = await fetch(`/api/assignments?${params.toString()}`);
      const asgData = await asgRes.json();
      if (asgData.success) {
        setAssignments(asgData.assignments || []);
      }

      // Refresh Stats
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.authenticated) {
        setStats(meData.stats);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoadingData(false);
    }
  }, [user, activeTab, targetCategory, searchQuery, selectedSubjectId, selectedPriority, sortBy]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Proactive Deadline Scanner on Mount
  useEffect(() => {
    if (user) {
      fetch('/api/notifications', { method: 'POST' })
        .then((r) => r.json())
        .then((d) => {
          if (d.newAlertsCreated > 0) {
            sendBrowserPushNotification(
              '⚠️ Impending Academic Deadlines',
              `You have ${d.newAlertsCreated} upcoming task deadlines approaching!`
            );
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // 1-Click Demo Login
  const handleDemoLogin = async () => {
    try {
      setLoadingAuth(true);
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        await checkAuth();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStats(null);
    setAssignments([]);
    setSubjects([]);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const endpoint = authMode === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
      const body =
        authMode === 'LOGIN'
          ? { email: authEmail, password: authPassword }
          : {
              name: authName,
              email: authEmail,
              password: authPassword,
              institution: authInstitution,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setUser(data.user);
      setIsAuthModalOpen(false);
      await checkAuth();
    } catch (err: any) {
      setAuthError(err.message || 'Error occurred');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Toggle task status
  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanDeadlines = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'POST' });
      const data = await res.json();
      alert(`Scanned ${data.scannedCount} active tasks. ${data.newAlertsCreated} new notifications generated.`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        user={user}
        unreadCount={stats?.unreadNotifs || 0}
        onRefreshData={fetchData}
        onOpenTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
        onOpenAIScheduler={() => setIsAISchedulerOpen(true)}
        onOpenShowcase={() => setIsShowcaseOpen(true)}
        onLogout={handleLogout}
        onDemoLogin={handleDemoLogin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* If user is not logged in: Show Presentation Hero & Demo Access */}
        {!user && !loadingAuth && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 p-8 sm:p-12 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 mb-6">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>B.Tech Engineering Minor Project Presentation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
              Assignment Reminder App — Smart Academic Task Manager
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              An intelligent cross-platform solution engineered to streamline academic submissions, eradicate missed deadlines, and eliminate student organizational chaos across multi-subject coursework.
            </p>

            {/* Quick Demo CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleDemoLogin}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>1-Click Presentation Demo Login</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('LOGIN');
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Student Sign In / Register</span>
              </button>

              <button
                onClick={() => setIsShowcaseOpen(true)}
                className="px-5 py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold text-sm border border-indigo-500/30 transition-colors flex items-center gap-2"
              >
                <Presentation className="w-4 h-4" />
                <span>View Slides (1-10)</span>
              </button>
            </div>

            {/* Presentation Pillars (Slides 3, 5, 8) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-wider block mb-1">
                  Problem Solved (Slide 3)
                </span>
                <h2 className="text-sm font-bold text-white mb-1">No More Forgotten Deadlines</h2>
                <p className="text-xs text-slate-400">
                  Replaces fragile diaries and manual calendar entries with centralized automated alerts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider block mb-1">
                  Core Solution (Slide 5)
                </span>
                <h2 className="text-sm font-bold text-white mb-1">Subject Categorization</h2>
                <p className="text-xs text-slate-400">
                  Structure lab records, technical reports, and homework by courses (CS601, CS602, etc.).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
                  Unique Selling Point (Slide 8)
                </span>
                <h2 className="text-sm font-bold text-white mb-1">Dual-Tracking Engine</h2>
                <p className="text-xs text-slate-400">
                  Clear separation between impending requirements and verified finalized deliverables.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* If user is logged in: Complete Academic Management Suite */}
        {user && (
          <>
            {/* System Architecture & Workflow Pipeline (Slide 7) */}
            <WorkflowBanner
              onAddTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              activeTasksCount={stats?.pending || 0}
            />

            {/* Proactive Deadline Alerts Banner (Slide 8) */}
            <UrgentDeadlinesAlert
              assignments={assignments}
              onSelectTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onScanNow={handleScanDeadlines}
            />

            {/* Target Audience Sector Switcher (Slide 9) */}
            <TargetAudienceSelector
              selected={targetCategory}
              onSelect={(cat) => setTargetCategory(cat)}
            />

            {/* Dual Tracking Views Header (Slide 8) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <DualTrackingTabs
                activeTab={activeTab}
                onSelectTab={(tab) => setActiveTab(tab)}
                pendingCount={stats?.pending || 0}
                finalizedCount={stats?.completed || 0}
              />

              {/* Action Buttons: Add Task & Manage Subjects */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => setIsSubjectModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Subjects ({subjects.length})</span>
                </button>

                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Task</span>
                </button>
              </div>
            </div>

            {/* Dynamic Tab Content */}
            {activeTab === 'CALENDAR' ? (
              <CalendarView
                assignments={assignments}
                onSelectTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
              />
            ) : activeTab === 'ANALYTICS' ? (
              <AnalyticsView assignments={assignments} subjects={subjects} />
            ) : (
              /* Task List View (Pending or Finalized) */
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Search box */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assignment title, keywords, course code..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Subject Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 hidden sm:inline">Course:</span>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    >
                      <option value="ALL">All Subjects</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code}: {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 hidden sm:inline">Priority:</span>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 hidden sm:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                    >
                      <option value="due_date_asc">Earliest Deadline</option>
                      <option value="due_date_desc">Latest Deadline</option>
                      <option value="priority">Highest Priority</option>
                      <option value="title">Alphabetical (A-Z)</option>
                    </select>
                  </div>
                </div>

                {/* Assignment Cards Grid */}
                {loadingData ? (
                  <div className="py-20 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-semibold">Updating academic deliverables...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80">
                    <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white">
                      {activeTab === 'FINALIZED'
                        ? 'No Finalized Assignments Yet'
                        : 'No Pending Requirements Found'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {activeTab === 'FINALIZED'
                        ? 'When you complete an assignment, click "Mark Complete" to move it into this verified archive.'
                        : 'Great work! No pending assignments match your active filters. Add a new task or adjust your filters.'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      + Add Academic Task
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onEdit={(asg) => {
                          setEditingTask(asg);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Assignment Reminder App</span>
            <span>• Smart Academic Task Manager</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400">
              B.Tech Project Presentation
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsShowcaseOpen(true)} className="hover:text-blue-400 transition-colors">
              Slide Inspector
            </button>
            <a href="/api/export/ics" className="hover:text-blue-400 transition-colors">
              Download .ICS
            </a>
            <span>Node.js v24 • SQLite WAL • Next.js App Router</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        subjects={subjects}
        initialTask={editingTask}
        onSaved={fetchData}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        subjects={subjects}
        onRefresh={fetchData}
      />

      <AISchedulerModal
        isOpen={isAISchedulerOpen}
        onClose={() => setIsAISchedulerOpen(false)}
      />

      <ProjectShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
      />

      {/* Manual Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold">
                {authMode === 'LOGIN' ? 'Student Sign In' : 'Create Student Account'}
              </h2>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / Institution
                    </label>
                    <input
                      type="text"
                      value={authInstitution}
                      onChange={(e) => setAuthInstitution(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering (B.Tech)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {authSubmitting
                  ? 'Processing...'
                  : authMode === 'LOGIN'
                  ? 'Sign In to Portal'
                  : 'Register Account'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              {authMode === 'LOGIN' ? (
                <p>
                  New student?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('REGISTER');
                      setAuthError('');
                    }}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('LOGIN');
                      setAuthError('');
                    }}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
