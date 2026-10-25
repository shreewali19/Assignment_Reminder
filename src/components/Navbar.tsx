'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut,
  User as UserIcon,
  Download,
  AlertTriangle,
  Presentation,
  Check,
  ChevronDown
} from 'lucide-react';
import { AuthUser, InAppNotification } from '@/lib/types';
import { requestNotificationPermission, sendBrowserPushNotification } from '@/lib/notifications';

interface NavbarProps {
  user: AuthUser | null;
  unreadCount: number;
  onRefreshData: () => void;
  onOpenTaskModal: () => void;
  onOpenSubjectModal: () => void;
  onOpenAIScheduler: () => void;
  onOpenShowcase: () => void;
  onLogout: () => void;
  onDemoLogin: () => void;
}

export function Navbar({
  user,
  unreadCount,
  onRefreshData,
  onOpenTaskModal,
  onOpenSubjectModal,
  onOpenAIScheduler,
  onOpenShowcase,
  onLogout,
  onDemoLogin,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      loadNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPushEnabled(granted);
    if (granted) {
      sendBrowserPushNotification(
        '🔔 Notifications Enabled',
        'You will now receive proactive alerts for assignment deadlines.'
      );
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset sample academic data for B.Tech CSE presentation?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      onRefreshData();
      alert('Demo coursework & deadlines refreshed successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                  Assignment Reminder App
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  🎓 B.Tech Project
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Academic Task Manager & Deadline Tracker
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Project Presentation Defense Notes Button */}
            <button
              onClick={onOpenShowcase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors shadow-sm"
              title="Inspect Project Architecture & Defense Slides"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Presentation Slides & Defense</span>
              <span className="md:hidden">Slides</span>
            </button>

            {/* AI Scheduler (Slide 10) */}
            <button
              onClick={onOpenAIScheduler}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-200 border border-purple-500/30 transition-all shadow-sm"
              title="AI Study Scheduler Suggestions"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden md:inline">AI Study Plan</span>
            </button>

            {/* Calendar Export */}
            <a
              href="/api/export/ics"
              download="academic-deadlines.ics"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Sync with Google Calendar / Outlook"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export .ICS</span>
            </a>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleToggleNotifications}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-white">Academic Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Browser Web Push Permission Notice */}
                  {!pushEnabled && (
                    <div className="p-2.5 bg-blue-950/40 border-b border-blue-900/40 flex items-center justify-between text-xs text-blue-200">
                      <span>Enable device desktop alerts</span>
                      <button
                        onClick={handleEnablePush}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
                      >
                        Enable
                      </button>
                    </div>
                  )}

                  {/* Notifications list */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                    {loadingNotifs ? (
                      <div className="p-6 text-center text-xs text-slate-400">Loading alerts...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                        No alerts! All academic deadlines are clear.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors ${
                            n.is_read ? 'bg-slate-900 text-slate-400' : 'bg-slate-800/40 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'TASK_OVERDUE' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            ) : n.type === 'TASK_COMPLETED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-white">{n.title}</p>
                              <p className="mt-0.5 text-slate-300">{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset / Reseed Demo Data Button */}
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset sample college courses & assignments"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

            {/* User Profile / Demo Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.semester || 'B.Tech CSE'}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onDemoLogin}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              >
                1-Click Demo Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
