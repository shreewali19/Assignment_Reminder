'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle2, AlertCircle, Calendar, Bot } from 'lucide-react';

interface AISchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISchedulerModal({ isOpen, onClose }: AISchedulerModalProps) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    if (isOpen) {
      generateAISchedule();
    }
  }, [isOpen]);

  const generateAISchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-scheduler', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule || []);
        setTotalMinutes(data.totalPlannedMinutes || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  AI Smart Scheduling Suggestions
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Slide 10 Feature
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cognitive load-balanced study block allocations based on approaching deadlines
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

        {/* Content */}
        <div className="mt-5">
          {loading ? (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                Analyzing pending deliverables, estimated hours, and deadline proximity...
              </p>
              <p className="text-xs text-slate-400 mt-1">Generating optimal focus session timeline</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Pending Deadlines</p>
              <p className="text-xs text-slate-400 mt-1">
                You have finished all active academic tasks! Relax or get ahead on upcoming semester topics.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>
                    Total Recommended Study Time: <strong>{Math.round(totalMinutes / 60 * 10) / 10} hours</strong> ({schedule.length} focused study blocks)
                  </span>
                </div>
                <button
                  onClick={generateAISchedule}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
                >
                  Regenerate
                </button>
              </div>

              {/* Timeline blocks */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {schedule.map((block, idx) => (
                  <div
                    key={block.blockId}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-purple-500/40 transition-all flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shrink-0 text-center">
                      <span className="text-[10px] font-mono font-bold text-purple-400">0{idx + 1}</span>
                      <span className="text-[9px] text-slate-500 uppercase">{block.durationMins}m</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                            {block.subjectCode}
                          </span>
                          <span className="text-xs font-semibold text-white">{block.title}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-300">
                          {block.startTime} – {block.endTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        💡 {block.recommendationReason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Future Scope Note */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            🎓 <strong>Presentation Slide 10:</strong> Demonstrates AI Smart Scheduling engine & study interval optimizer.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
