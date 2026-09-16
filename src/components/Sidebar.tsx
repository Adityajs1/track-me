'use client';

import React from 'react';
import { GoalData } from '@/lib/types';
import { ZiffyLogo } from './ZiffyLogo';
import {
  Target,
  CheckCircle2,
  Calendar,
  BookOpen,
  Plus,
  Flame,
  ChevronRight,
  Hash,
  Sparkles,
  Layers,
  LayoutDashboard,
  Home,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'goals' | 'checkin' | 'timeblock' | 'notes';
  setActiveTab: (tab: 'goals' | 'checkin' | 'timeblock' | 'notes') => void;
  goals: GoalData[];
  selectedGoalId: string | null;
  onSelectGoal: (goal: GoalData) => void;
  onOpenNewGoal: () => void;
  onOpenLanding: () => void;
  totalPoints: number;
  activeStreak: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  goals,
  selectedGoalId,
  onSelectGoal,
  onOpenNewGoal,
  onOpenLanding,
  totalPoints,
  activeStreak,
}) => {
  return (
    <aside className="w-64 border-r border-[#2E2E2E] bg-[#161616] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-white select-none">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-2 py-2">
          <button
            onClick={onOpenLanding}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
          >
            <ZiffyLogo size="sm" />
          </button>
        </div>

        {/* Core Navigation Views */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Workspace
          </div>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'goals' && !selectedGoalId
                ? 'bg-[#232323] text-white font-semibold'
                : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#00C2CB]" />
              <span>Goals & Habits</span>
            </div>
            <span className="text-[10px] text-white/40 bg-[#1B1B1B] px-1.5 py-0.5 rounded">
              {goals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-[#232323] text-white font-semibold'
                : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#FF4FA3]" />
              <span>Daily Check-in</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('timeblock')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'timeblock'
                ? 'bg-[#232323] text-white font-semibold'
                : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00C2CB]" />
              <span>Time-Blocking</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#232323] text-white font-semibold'
                : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#FF4FA3]" />
              <span>Journal & Notes</span>
            </div>
          </button>
        </div>

        {/* Goals Tree (Dynamic Database hierarchy) */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
            <span>Your Goals</span>
            <button
              onClick={onOpenNewGoal}
              className="p-1 rounded hover:bg-[#232323] text-white/60 hover:text-white"
              title="Add a new goal"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="px-2 py-3 text-[11px] text-white/40">
              No goals yet. Click + to create one.
            </div>
          ) : (
            <div className="space-y-0.5">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGoal(g)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    selectedGoalId === g.id
                      ? 'bg-[#232323] text-white font-semibold border-l-2 border-[#00C2CB]'
                      : 'text-white/70 hover:bg-[#232323]/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C2CB]" />
                    <span className="truncate">{g.name}</span>
                  </div>
                  <span className="text-[10px] text-white/30 truncate ml-1">
                    {g.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Stats & New Goal Button */}
      <div className="p-3 border-t border-[#2E2E2E] bg-[#161616] space-y-2">
        <div className="flex items-center justify-between bg-[#1F1F1F] px-3 py-2 rounded-xl border border-[#2E2E2E] text-xs">
          <div className="flex items-center gap-1.5 text-[#FF4FA3] font-semibold">
            <Flame className="h-3.5 w-3.5 fill-[#FF4FA3]" />
            <span>{activeStreak}d streak</span>
          </div>
          <div className="text-white/60 text-[11px]">
            <span className="font-bold text-[#00C2CB]">{totalPoints}</span> pts
          </div>
        </div>

        <button
          onClick={onOpenNewGoal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#232323] hover:bg-[#FF4FA3] hover:text-[#1B1B1B] text-white px-3 py-2 text-xs font-semibold border border-[#2E2E2E] transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Goal</span>
        </button>
      </div>
    </aside>
  );
};
