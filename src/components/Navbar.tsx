'use client';

import React from 'react';
import { ZiffyLogo } from './ZiffyLogo';
import { Target, CheckCircle2, Calendar, BookOpen, Flame, Plus, Bell, Home } from 'lucide-react';

interface NavbarProps {
  activeTab: 'goals' | 'checkin' | 'timeblock' | 'notes';
  setActiveTab: (tab: 'goals' | 'checkin' | 'timeblock' | 'notes') => void;
  onOpenNewGoal: () => void;
  onOpenLanding: () => void;
  totalPoints: number;
  activeStreak: number;
  unreadRemindersCount?: number;
  onToggleReminders?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewGoal,
  onOpenLanding,
  totalPoints,
  activeStreak,
  unreadRemindersCount = 0,
  onToggleReminders,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#2E2E2E] bg-[#1B1B1B]/90 backdrop-blur-md text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand with Owl Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={onOpenLanding}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <ZiffyLogo size="sm" />
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'goals'
                  ? 'bg-[#232323] text-[#00C2CB] border border-[#2E2E2E]'
                  : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              Goals & Habits
            </button>

            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'checkin'
                  ? 'bg-[#232323] text-[#00C2CB] border border-[#2E2E2E]'
                  : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Daily Check-in
            </button>

            <button
              onClick={() => setActiveTab('timeblock')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'timeblock'
                  ? 'bg-[#232323] text-[#FF4FA3] border border-[#2E2E2E]'
                  : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Time-Blocking
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'notes'
                  ? 'bg-[#232323] text-[#FF4FA3] border border-[#2E2E2E]'
                  : 'text-white/70 hover:bg-[#232323]/50 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Journal
            </button>
          </nav>
        </div>

        {/* Right Section: Streak, Points & New Goal Action */}
        <div className="flex items-center gap-3">
          {/* Streak & Points Badges with Bubblegum Pop colors */}
          <div className="hidden sm:flex items-center gap-2.5 bg-[#232323] px-3.5 py-1.5 rounded-full border border-[#2E2E2E] text-xs">
            <div className="flex items-center gap-1 text-[#FF4FA3] font-semibold">
              <Flame className="h-3.5 w-3.5 fill-[#FF4FA3]" />
              <span>{activeStreak}d streak</span>
            </div>
            <span className="text-[#2E2E2E]">|</span>
            <div className="text-white/80 font-medium">
              <span className="font-bold text-[#00C2CB]">{totalPoints}</span> pts
            </div>
          </div>

          {/* Reminder Bell */}
          {onToggleReminders && (
            <button
              onClick={onToggleReminders}
              className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-[#232323] transition-colors"
              title="Notifications & Reminders"
            >
              <Bell className="h-4 w-4" />
              {unreadRemindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF4FA3] ring-2 ring-[#1B1B1B]" />
              )}
            </button>
          )}

          {/* Create Goal Button */}
          <button
            onClick={onOpenNewGoal}
            className="flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-3.5 py-2 text-xs font-bold text-[#1B1B1B] shadow-sm hover:bg-white hover:text-[#1B1B1B] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="flex md:hidden border-t border-[#2E2E2E] px-4 py-2 gap-2 overflow-x-auto bg-[#1B1B1B]">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'goals'
              ? 'bg-[#232323] text-[#00C2CB] border border-[#2E2E2E]'
              : 'text-white/60'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          Goals
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'bg-[#232323] text-[#00C2CB] border border-[#2E2E2E]'
              : 'text-white/60'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Check-in
        </button>
        <button
          onClick={() => setActiveTab('timeblock')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'timeblock'
              ? 'bg-[#232323] text-[#FF4FA3] border border-[#2E2E2E]'
              : 'text-white/60'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Time-Block
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-[#232323] text-[#FF4FA3] border border-[#2E2E2E]'
              : 'text-white/60'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Journal
        </button>
      </div>
    </header>
  );
};
