'use client';

import React, { useState } from 'react';
import { TaskData, TimeBlockData } from '@/lib/types';
import { format, addMinutes, parse, startOfDay } from 'date-fns';
import { Clock, Plus, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';

interface TimeBlockingViewProps {
  tasks: TaskData[];
  timeBlocks: TimeBlockData[];
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  onCreateTimeBlock: (block: {
    taskId?: string;
    taskInstanceId?: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  onDeleteTimeBlock: (id: string) => Promise<void>;
}

export const TimeBlockingView: React.FC<TimeBlockingViewProps> = ({
  tasks,
  timeBlocks,
  selectedDate,
  onDateChange,
  onCreateTimeBlock,
  onDeleteTimeBlock,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAdding, setIsAdding] = useState(false);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 AM to 22:00 (10 PM)

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !startTime || !endTime) return;

    const task = tasks.find((t) => t.id === selectedTaskId);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    await onCreateTimeBlock({
      taskId: task?.isRecurring ? undefined : task?.id,
      taskInstanceId: task?.isRecurring ? ((task as any).instanceId || undefined) : undefined,
      date: dateStr,
      startTime,
      endTime,
    });

    setIsAdding(false);
    setSelectedTaskId('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Schedule & Time Allocation
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
            Time-Blocking Schedule
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Turn things to do into concrete time commitments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 shadow-xs"
          />

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Block Time</span>
          </button>
        </div>
      </div>

      {/* Add Time Block Form */}
      {isAdding && (
        <form
          onSubmit={handleAddBlock}
          className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Schedule a Task for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Select Task
              </label>
              <select
                required
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">-- Choose task or habit --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.goal?.name ? `[${t.goal.name}] ` : ''}{t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3.5 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      )}

      {/* Daily Timeline Grid */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 p-6 shadow-xs">
        <div className="space-y-3">
          {hours.map((hour) => {
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;
            const nextHourStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

            // Find blocks starting or spanning in this hour
            const activeInHour = timeBlocks.filter((b) => {
              return b.startTime <= hourStr && b.endTime > hourStr;
            });

            return (
              <div key={hour} className="group relative flex items-start gap-4 min-h-[52px]">
                {/* Hour label */}
                <div className="w-14 text-right text-xs font-mono text-zinc-400 pt-0.5 shrink-0">
                  {hourStr}
                </div>

                {/* Timeline vertical rule & content */}
                <div className="relative flex-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-1 pb-2">
                  {activeInHour.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeInHour.map((block) => {
                        const taskName =
                          block.task?.title || block.taskInstance?.task?.title || 'Scheduled Focus Block';
                        const goalName =
                          block.task?.goal?.name || block.taskInstance?.task?.goal?.name || 'Goal';

                        return (
                          <div
                            key={block.id}
                            className="flex items-center justify-between rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3.5 py-2 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              <div className="truncate">
                                <span className="text-xs font-semibold">{taskName}</span>
                                <span className="ml-2 text-[11px] opacity-75">
                                  ({block.startTime} - {block.endTime}) · {goalName}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onDeleteTimeBlock(block.id)}
                              className="text-zinc-400 hover:text-rose-400 dark:hover:text-rose-600 transition-colors ml-2"
                              title="Remove time block"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setStartTime(hourStr);
                        setEndTime(nextHourStr);
                        setIsAdding(true);
                      }}
                      className="h-7 w-full rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer flex items-center px-2 text-[11px] text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100"
                    >
                      + Click to block {hourStr}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
