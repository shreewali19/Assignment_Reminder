'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Bookmark, Send, Sparkles } from 'lucide-react';
import { Assignment, Subject, TaskType, Priority, Status, SubmissionType } from '@/lib/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialTask?: Assignment | null;
  onSaved: () => void;
}

export function TaskModal({
  isOpen,
  onClose,
  subjects,
  initialTask,
  onSaved,
}: TaskModalProps) {
  const isEditing = Boolean(initialTask);

  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('ASSIGNMENT');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<Status>('PENDING');
  const [submissionType, setSubmissionType] = useState<SubmissionType>('ONLINE_PORTAL');
  const [submissionLink, setSubmissionLink] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2.0);
  const [remindBefore, setRemindBefore] = useState('24_HOURS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTask) {
      setSubjectId(initialTask.subject_id);
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setTaskType(initialTask.task_type);
      // Format ISO string to datetime-local format: YYYY-MM-DDTHH:mm
      try {
        const d = new Date(initialTask.due_date);
        const pad = (n: number) => (n < 10 ? '0' + n : n);
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueDate(formatted);
      } catch {
        setDueDate('');
      }
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setSubmissionType(initialTask.submission_type);
      setSubmissionLink(initialTask.submission_link || '');
      setEstimatedHours(initialTask.estimated_hours || 2.0);
    } else {
      // Default to 1st subject if available
      if (subjects.length > 0 && !subjectId) {
        setSubjectId(subjects[0].id);
      }
      setTitle('');
      setDescription('');
      setTaskType('ASSIGNMENT');
      // Default due date: tomorrow at 23:59
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 0, 0);
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      setDueDate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`);
      setPriority('MEDIUM');
      setStatus('PENDING');
      setSubmissionType('ONLINE_PORTAL');
      setSubmissionLink('');
      setEstimatedHours(2.5);
      setRemindBefore('24_HOURS');
    }
    setErrorMsg('');
  }, [initialTask, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setErrorMsg('Please select a subject or create one first.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please provide a title for the assignment.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Please select a due date and time.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        subjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        taskType,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status,
        submissionType,
        submissionLink: submissionLink.trim() || undefined,
        estimatedHours: Number(estimatedHours) || 2.0,
        remindBefore,
      };

      const url = isEditing ? `/api/assignments/${initialTask!.id}` : '/api/assignments';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save task');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isEditing ? 'Edit Academic Task' : 'Add Academic Task & Deadline'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured categorization & automated reminder scheduling
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Algorithms Lab Report"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Subject & Task Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Course / Subject *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Task Category (Slide 5) *
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ASSIGNMENT">Assignment (Standard)</option>
                <option value="LAB_RECORD">Lab Record / Practical</option>
                <option value="PROJECT_REPORT">Project Report / Thesis</option>
                <option value="QUIZ_PREP">Quiz Prep / Internal Exam</option>
                <option value="PRACTICE_PROBLEMS">Practice Problem Set</option>
              </select>
            </div>
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Low (Flexible deadline)</option>
                <option value="MEDIUM">Medium (Standard deliverable)</option>
                <option value="HIGH">High (Major grading weight)</option>
                <option value="URGENT">Urgent (Immediate deadline)</option>
              </select>
            </div>
          </div>

          {/* Submission Mode & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Submission Mode
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as SubmissionType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ONLINE_PORTAL">Online LMS / Google Classroom</option>
                <option value="HARD_COPY">Physical Hard Copy / Lab Room</option>
                <option value="GITHUB_REPO">GitHub Repository Link</option>
                <option value="EMAIL">Email to Professor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Submission Target / URL / Room
              </label>
              <input
                type="text"
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                placeholder="e.g. Lab 402 or https://moodle.college.edu/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Estimated Work Hours & Proactive Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estimated Work Effort (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="80"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Proactive Notification Trigger (Slide 8)
              </label>
              <select
                value={remindBefore}
                onChange={(e) => setRemindBefore(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="1_HOUR">1 hour before deadline</option>
                <option value="3_HOURS">3 hours before deadline</option>
                <option value="24_HOURS">24 hours before deadline (Recommended)</option>
                <option value="48_HOURS">48 hours before deadline</option>
              </select>
            </div>
          </div>

          {/* Description / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Notes / Instructions / Requirements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste assignment questions, formatting criteria, reference chapters, or teammate responsibilities..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Save & Schedule Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
