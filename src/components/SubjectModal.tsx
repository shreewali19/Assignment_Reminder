'use client';

import React, { useState } from 'react';
import { X, Plus, BookOpen, Trash2, Edit3, Check } from 'lucide-react';
import { Subject } from '@/lib/types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onRefresh: () => void;
}

export function SubjectModal({
  isOpen,
  onClose,
  subjects,
  onRefresh,
}: SubjectModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [credits, setCredits] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const colors = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#6366f1', // Indigo
  ];

  if (!isOpen) return null;

  const handleStartEdit = (s: Subject) => {
    setEditingId(s.id);
    setName(s.name);
    setCode(s.code);
    setProfessor(s.professor || '');
    setColor(s.color);
    setCredits(s.credits);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setProfessor('');
    setColor('#3b82f6');
    setCredits(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Course name and code are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        professor: professor.trim() || undefined,
        color,
        credits: Number(credits) || 3,
      };

      const url = editingId ? `/api/subjects/${editingId}` : '/api/subjects';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save subject');

      handleCancelEdit();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete subject "${name}" and all its assignments?`)) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Academic Courses & Subjects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Subject Categorization (Slide 5: Cleanly structure and filter assignments)
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

        {/* Add / Edit Form */}
        <form onSubmit={handleSubmit} className="mt-5 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {editingId ? 'Edit Subject Details' : 'Add New Course / Subject'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS601"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Database Management Systems"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Professor / Instructor</label>
              <input
                type="text"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                placeholder="e.g. Dr. R. Sharma"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Course Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Color Tag</label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>

        {/* Existing Subjects List */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Configured Courses ({subjects.length})
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white tracking-wide">{s.code}</span>
                      <span className="text-xs text-slate-300">{s.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {s.professor || 'No professor assigned'} • {s.credits} Credits •{' '}
                      {s.total_tasks || 0} Tasks ({s.completed_tasks || 0} Done)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(s)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
