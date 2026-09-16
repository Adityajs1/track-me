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
      className="group relative flex flex-col justify-between rounded-2xl border border-[#2E2E2E] bg-[#232323]/80 p-5 shadow-sm transition-all duration-200 hover:border-[#00C2CB]/60 hover:shadow-lg hover:shadow-[#00C2CB]/5 cursor-pointer"
    >
      <div>
        {/* Header: Category & Metrics */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center rounded-lg bg-[#1B1B1B] px-2.5 py-0.5 text-xs font-semibold text-[#00C2CB] border border-[#2E2E2E]">
            {goal.category}
          </span>

          <div className="flex items-center gap-2">
            {metrics && (
              <>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#FF4FA3]">
                  <Flame className="h-3.5 w-3.5 fill-[#FF4FA3]" />
                  <span>{metrics.currentStreak}d</span>
                </div>
                <span className="text-[#2E2E2E]">·</span>
                <span className="text-xs font-medium text-white/70">
                  {metrics.totalPoints} pts
                </span>
              </>
            )}
          </div>
        </div>

        {/* Goal Title */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-white group-hover:text-[#00C2CB] transition-colors">
            {goal.name}
          </h3>
          <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        {/* Dates & Sub-elements count */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-white/50 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#00C2CB]" />
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
            <CheckCircle className="h-3.5 w-3.5 text-[#FF4FA3]" />
            <span>{goal.tasks?.length || 0} habits/tasks</span>
          </div>
        </div>
      </div>

      {/* Mini Heatmap trend */}
      <div className="pt-3 border-t border-[#2E2E2E]">
        <div className="flex items-center justify-between text-[11px] text-white/40 mb-1.5">
          <span>Recent 5 weeks</span>
          <span className="text-[10px] text-[#00C2CB]">View details →</span>
        </div>
        <Heatmap daysSummary={recentDays} compact />
      </div>
    </div>
  );
};
