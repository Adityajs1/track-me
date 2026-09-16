'use client';

import React from 'react';
import { Target, TrendingUp, Calendar, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50 px-3.5 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Personal Planning & Habit Consistency System
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 max-w-3xl mx-auto leading-[1.15]">
          Effort as a visible trend, not daily pass or fail.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Standard to-do lists treat every missed task as failure. TrackMe organizes your active goals into structured phases, time-blocks tasks into your day, and tracks consistency through calm, honest heatmaps.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all duration-150 cursor-pointer"
          >
            <span>Open Tracker</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 4 Pillars Preview */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mb-3">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Consistency Heatmaps</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
              Color-coded GitHub-style visual trends (≥80% dark green, 30–80% yellow, &lt;30% red). Resting days never penalize.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mb-3">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Time-Blocking</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
              Turn &ldquo;things to do&rdquo; into concrete hour slots on your day&apos;s schedule.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mb-3">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Goal → Plan → Task</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
              Flexible 3-level hierarchy with user-defined categories. Time-boxed phases when you need structure.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mb-3">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reflection Journal</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
              Lightweight notes scoped to individual goals or written as a general journal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
