'use client';

import React from 'react';
import { GoalData } from '@/lib/types';
import { Heatmap } from './Heatmap';
import { Flame, CheckCircle, Calendar, ChevronRight, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GoalCardProps {
  goal: GoalData;
  onSelect: (goal: GoalData) => void;
  onDelete?: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onSelect }) => {
  const metrics = goal.metrics;
  const recentDays = metrics?.daysSummary ? metrics.daysSummary.slice(-35) : [];

  return (
    <div
      onClick={() => onSelect(goal)}
      className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-zinc-700 cursor-pointer"
    >
      <div>
        {/* Header: Category & Metrics */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {goal.category}
          </span>

          <div className="flex items-center gap-2">
            {metrics && (
              <>
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Flame className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{metrics.currentStreak}d</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {metrics.totalPoints} pts
                </span>
              </>
            )}
          </div>
        </div>

        {/* Goal Title */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {goal.name}
          </h3>
          <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        {/* Dates & Sub-elements count */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(parseISO(goal.startDate), 'MMM d')}
              {goal.endDate ? ` → ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ' (ongoing)'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            <span>{goal.plans?.length || 0} plans</span>
          </div>

          <div className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{goal.tasks?.length || 0} habits/tasks</span>
          </div>
        </div>
      </div>

      {/* Mini Heatmap trend */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
          <span>Recent 5 weeks</span>
          <span className="text-[10px]">Tap to view details</span>
        </div>
        <Heatmap daysSummary={recentDays} compact />
      </div>
    </div>
  );
};
