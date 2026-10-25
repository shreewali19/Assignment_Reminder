'use client';

import React from 'react';
import { ListFilter, CheckCircle2, CalendarDays, BarChart3, Clock } from 'lucide-react';

export type ActiveTab = 'PENDING' | 'FINALIZED' | 'CALENDAR' | 'ANALYTICS';

interface DualTrackingTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingCount: number;
  finalizedCount: number;
}

export function DualTrackingTabs({
  activeTab,
  onSelectTab,
  pendingCount,
  finalizedCount,
}: DualTrackingTabsProps) {
  const tabs = [
    {
      id: 'PENDING' as ActiveTab,
      label: 'Pending Requirements',
      badge: pendingCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Clock,
      uspTag: 'Dual Tracking USP',
    },
    {
      id: 'FINALIZED' as ActiveTab,
      label: 'Successfully Finalized',
      badge: finalizedCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
      uspTag: 'Verified Archive',
    },
    {
      id: 'CALENDAR' as ActiveTab,
      label: 'Academic Timetable & Calendar',
      icon: CalendarDays,
      uspTag: 'Deadlines Grid',
    },
    {
      id: 'ANALYTICS' as ActiveTab,
      label: 'Workload & Analytics',
      icon: BarChart3,
      uspTag: 'Recharts Visuals',
    },
  ];

  return (
    <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isActive ? 'bg-white/20 text-white border-white/30' : tab.badgeColor
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
