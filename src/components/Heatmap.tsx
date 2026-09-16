'use client';

import React, { useState } from 'react';
import { DaySummary } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface HeatmapProps {
  daysSummary: DaySummary[];
  compact?: boolean;
  className?: string;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  daysSummary,
  compact = false,
  className = '',
}) => {
  const [hoveredDay, setHoveredDay] = useState<DaySummary | null>(null);

  // Group into columns of 7 days (weeks)
  const weeks: DaySummary[][] = [];
  let currentWeek: DaySummary[] = [];

  daysSummary.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === daysSummary.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getColorClass = (day: DaySummary) => {
    if (day.plannedCount === 0) {
      return 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800/40';
    }
    switch (day.color) {
      case 'green':
        return 'bg-emerald-600 dark:bg-emerald-500 border border-emerald-700/50 dark:border-emerald-400/50';
      case 'yellow':
        return 'bg-amber-400 dark:bg-amber-400 border border-amber-500/50 dark:border-amber-300/50';
      case 'red':
        return 'bg-rose-400 dark:bg-rose-500 border border-rose-500/50 dark:border-rose-400/50';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-800/40';
    }
  };

  const cellSize = compact ? 'w-2.5 h-2.5 rounded-[2px]' : 'w-3.5 h-3.5 rounded-sm';

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {/* Grid container */}
      <div className="flex items-end gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`${cellSize} ${getColorClass(day)} transition-all duration-150 hover:scale-125 hover:z-10 cursor-pointer`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip on Hover */}
      {hoveredDay && (
        <div className="absolute -top-12 left-2 z-20 pointer-events-none rounded-md bg-zinc-900 px-2.5 py-1 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900 animate-in fade-in zoom-in-95 duration-100">
          <div className="font-medium">{format(parseISO(hoveredDay.date), 'EEE, MMM d, yyyy')}</div>
          <div className="text-[11px] opacity-90">
            {hoveredDay.plannedCount === 0 ? (
              <span>No tasks scheduled (rest day)</span>
            ) : (
              <span>
                {hoveredDay.doneCount}/{hoveredDay.plannedCount} completed ({Math.round(hoveredDay.completionRate * 100)}%) · +{hoveredDay.points} pts
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {!compact && (
        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
          <span>Consistency trend</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
              Rest / 0 planned
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-rose-400 dark:bg-rose-500" />
              &lt;30%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-amber-400" />
              30-80%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
              ≥80%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
