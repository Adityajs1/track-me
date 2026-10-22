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
      return 'bg-white/[0.04] border border-white/[0.07]';
    }
    switch (day.color) {
      case 'green':
        return 'bg-white border border-white';
      case 'yellow':
        return 'bg-neutral-400 border border-neutral-300';
      case 'red':
        return 'bg-neutral-700 border border-neutral-600';
      default:
        return 'bg-white/[0.04] border border-white/[0.07]';
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
        <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
          <span>Consistency trend</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-white/[0.04] border border-white/10" />
              Rest / 0 planned
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-neutral-700" />
              &lt;30%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-neutral-400" />
              30-80%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-white" />
              ≥80%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
