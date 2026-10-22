'use client';

import React, { useState } from 'react';
import { ProductivityDayData, ProductivityOverviewData } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Flame, CheckCircle2, Target, Repeat, Calendar, Award } from 'lucide-react';

interface ProductivityHeatmapProps {
  data: ProductivityOverviewData;
  isLoading?: boolean;
  className?: string;
}

export const ProductivityHeatmap: React.FC<ProductivityHeatmapProps> = ({
  data,
  isLoading = false,
  className = '',
}) => {
  const [hoveredDay, setHoveredDay] = useState<ProductivityDayData | null>(null);

  // Group days into columns of 7 days (weeks)
  const weeks: ProductivityDayData[][] = [];
  let currentWeek: ProductivityDayData[] = [];

  data.days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === data.days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getCellClasses = (day: ProductivityDayData) => {
    switch (day.intensity) {
      case 1:
        return 'bg-emerald-950/90 border border-emerald-800/50 hover:border-emerald-600';
      case 2:
        return 'bg-emerald-700/80 border border-emerald-600/60 hover:border-emerald-400';
      case 3:
        return 'bg-emerald-500 border border-emerald-400/80 hover:border-emerald-300';
      case 4:
        return 'bg-emerald-400 border border-emerald-200 hover:brightness-125';
      default:
        return 'bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08]';
    }
  };

  const dayNames = ['Mon', 'Wed', 'Fri', 'Sun'];

  return (
    <div className={`glass-panel rounded-2xl p-6 text-white space-y-6 ${className}`}>
      {/* Top Header with Key Productivity Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-1">
            <Award className="h-3.5 w-3.5 text-[#00C2CB]" />
            <span>Productivity Activity</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Daily Completion Heatmap
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Real activity calculated as: Goals Completed + Habits Completed + Daily Check-ins.
          </p>
        </div>

        {/* Streaks & Totals badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232323] border border-white/10">
            <Flame className="h-3.5 w-3.5 text-[#FF4FA3]" />
            <span className="font-semibold text-white">{data.currentStreak}d</span>
            <span className="text-white/40">streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#232323] border border-white/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00C2CB]" />
            <span className="font-semibold text-white">{data.totalEvents}</span>
            <span className="text-white/40">total completions</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Section */}
      <div className="relative pt-1">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {/* Day of Week Labels */}
          <div className="flex flex-col justify-between text-[10px] font-mono text-white/30 pr-1 py-0.5 select-none shrink-0 h-[100px]">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          {/* 7-day Week Columns */}
          <div className="flex gap-1.5">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-150 cursor-pointer ${getCellClasses(
                      day
                    )} hover:scale-125 hover:z-20`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tooltip Card on Hover */}
        {hoveredDay && (
          <div className="absolute -top-16 left-8 z-30 pointer-events-none rounded-xl border border-white/20 bg-[#161616] p-3 text-xs text-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 min-w-[200px]">
            <div className="font-semibold text-white">
              {format(parseISO(hoveredDay.date), 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-[11px] text-[#00C2CB] font-mono mt-0.5 font-bold">
              {hoveredDay.totalEvents === 0
                ? 'No completions recorded'
                : `${hoveredDay.totalEvents} completion ${hoveredDay.totalEvents === 1 ? 'event' : 'events'}`}
            </div>
            {hoveredDay.totalEvents > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-0.5 text-[10px] text-white/70">
                {hoveredDay.goalsCompletedCount > 0 && (
                  <div>• Goals completed: <strong>{hoveredDay.goalsCompletedCount}</strong></div>
                )}
                {hoveredDay.habitsCompletedCount > 0 && (
                  <div>• Habits completed: <strong>{hoveredDay.habitsCompletedCount}</strong></div>
                )}
                {hoveredDay.hasCheckIn && (
                  <div className="text-emerald-400">• Daily check-in: Completed ✓</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend & Breakdown Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-white/50 border-t border-white/10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-white/70" />
            <span>{data.totalGoalsCompleted} Goals Finished</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-white/70" />
            <span>{data.totalHabitCompletions} Habit Check-ins</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-white/70" />
            <span>{data.totalCheckIns} Reflections</span>
          </span>
        </div>

        {/* GitHub style intensity legend */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-[2px] bg-white/[0.04] border border-white/10" title="0 events" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-950/90 border border-emerald-800/50" title="1 event" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-700/80 border border-emerald-600/60" title="2 events" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-500 border border-emerald-400" title="3-4 events" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-200" title="5+ events" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
