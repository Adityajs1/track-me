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
    <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-white select-none">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-1 py-1">
          <button
            onClick={onOpenLanding}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer focus:outline-none"
          >
            <ZiffyLogo size="sm" />
          </button>
        </div>

        {/* Core Navigation Views */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Workspace
          </div>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'goals' && !selectedGoalId
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Target className="h-4 w-4 stroke-[1.5]" />
              <span>Goals & Habits</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                activeTab === 'goals' && !selectedGoalId
                  ? 'bg-black/10 text-black'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {goals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 stroke-[1.5]" />
              <span>Daily Check-in</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('timeblock')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'timeblock'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 stroke-[1.5]" />
              <span>Time-Blocking</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 stroke-[1.5]" />
              <span>Journal & Notes</span>
            </div>
          </button>
        </div>

        {/* Goals Tree (Dynamic Database hierarchy) */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-white/40">
            <span>Your Goals</span>
            <button
              onClick={onOpenNewGoal}
              className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Add a new goal"
            >
              <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="px-2 py-3 text-[11px] text-white/30 leading-normal">
              Clean state. Click &ldquo;+&rdquo; or create a goal to begin.
            </div>
          ) : (
            <div className="space-y-1">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGoal(g)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                    selectedGoalId === g.id
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70 shrink-0" />
                    <span className="truncate">{g.name}</span>
                  </div>
                  <span className="text-[10px] text-white/30 truncate ml-1 font-mono">
                    {g.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Stats & New Goal Button */}
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A] space-y-3">
        <div className="flex items-center justify-between glass-panel px-3.5 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Flame className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>{activeStreak}d streak</span>
          </div>
          <div className="text-white/50 text-[11px] font-mono">
            <span className="font-semibold text-white">{totalPoints}</span> pts
          </div>
        </div>

        <button
          onClick={onOpenNewGoal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/90 text-black px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2]" />
          <span>New Goal</span>
        </button>
      </div>
    </aside>
  );
};
