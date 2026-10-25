'use client';

import React from 'react';
import { Cpu, GraduationCap, Target, Globe2 } from 'lucide-react';

export type TargetCategory = 'ALL' | 'ENGINEERING' | 'UNIVERSITY' | 'COACHING' | 'ONLINE';

interface TargetAudienceSelectorProps {
  selected: TargetCategory;
  onSelect: (cat: TargetCategory) => void;
}

export function TargetAudienceSelector({ selected, onSelect }: TargetAudienceSelectorProps) {
  const options = [
    {
      id: 'ALL' as TargetCategory,
      title: 'All Target Sectors',
      subtitle: 'Complete Academic View',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'ENGINEERING' as TargetCategory,
      title: 'Engineering Colleges',
      subtitle: 'Lab Records & Reports (Slide 9)',
      icon: Cpu,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'UNIVERSITY' as TargetCategory,
      title: 'Schools & Universities',
      subtitle: 'Semester Homework & Tests',
      icon: GraduationCap,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'COACHING' as TargetCategory,
      title: 'Coaching Institutes',
      subtitle: 'Practice Sets & Exams',
      icon: Target,
      color: 'from-amber-500 to-rose-500',
    },
    {
      id: 'ONLINE' as TargetCategory,
      title: 'Online Learning',
      subtitle: 'Modular Certifications',
      icon: Globe2,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-semibold text-slate-400 shrink-0 hidden sm:inline mr-1">
        Target Sector (Slide 9):
      </span>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
              isSelected
                ? 'bg-gradient-to-r text-white shadow-md shadow-blue-500/20 ' + opt.color
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <div className="text-left">
              <span className="block leading-none font-semibold">{opt.title}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
