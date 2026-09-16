'use client';

import React from 'react';
import Link from 'next/navigation';
import { Target, CheckCircle2, Calendar, BookOpen, Flame, Plus, Bell } from 'lucide-react';

interface NavbarProps {
  activeTab: 'goals' | 'checkin' | 'timeblock' | 'notes';
  setActiveTab: (tab: 'goals' | 'checkin' | 'timeblock' | 'notes') => void;
  onOpenNewGoal: () => void;
  totalPoints: number;
  activeStreak: number;
  unreadRemindersCount?: number;
  onToggleReminders?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewGoal,
  totalPoints,
  activeStreak,
  unreadRemindersCount = 0,
  onToggleReminders,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                TrackMe
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Effort as a trend
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Target className="h-4 w-4" />
              Goals & Habits
            </button>

            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'checkin'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Daily Check-in
            </button>

            <button
              onClick={() => setActiveTab('timeblock')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'timeblock'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Time-Blocking
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Journal
            </button>
          </nav>
        </div>

        {/* Right Section: Stats & New Goal Action */}
        <div className="flex items-center gap-3">
          {/* Streak & Points Badges */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-500" />
              <span>{activeStreak}d streak</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <div className="text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPoints}</span> pts
            </div>
          </div>

          {/* Reminder Bell */}
          {onToggleReminders && (
            <button
              onClick={onToggleReminders}
              className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Notifications & Reminders"
            >
              <Bell className="h-4 w-4" />
              {unreadRemindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
              )}
            </button>
          )}

          {/* Create Goal Button */}
          <button
            onClick={onOpenNewGoal}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="flex md:hidden border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'goals'
              ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          Goals
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Check-in
        </button>
        <button
          onClick={() => setActiveTab('timeblock')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'timeblock'
              ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Time-Block
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Journal
        </button>
      </div>
    </header>
  );
};
