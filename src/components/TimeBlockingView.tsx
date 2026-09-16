'use client';

import React, { useState } from 'react';
import { TaskData, TimeBlockData } from '@/lib/types';
import { format } from 'date-fns';
import { Clock, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      {/* Notion Page Header */}
      <div className="pb-4 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
          <span>Ziffy</span>
          <span>/</span>
          <span className="text-white">Time-Blocking</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] border border-[#2E2E2E] text-[#00C2CB]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Time-Blocking Schedule
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                Allocate tasks to specific hours on your day calendar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => onDateChange(new Date(e.target.value))}
              className="rounded-lg border border-[#2E2E2E] bg-[#1F1F1F] px-3 py-1.5 text-xs text-white"
            />

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-3.5 py-1.5 text-xs font-bold text-[#1B1B1B] shadow-sm hover:bg-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Block Time</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Time Block Form */}
      {isAdding && (
        <form
          onSubmit={handleAddBlock}
          className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3 shadow-md"
        >
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Schedule a Task for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Select Task or Habit
              </label>
              <select
                required
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
              >
                <option value="">-- Choose task --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.goal?.name ? `[${t.goal.name}] ` : ''}{t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#FF4FA3] px-3.5 py-1.5 text-xs font-bold text-[#1B1B1B]"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      )}

      {/* Hourly Timeline Grid */}
      <div className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4">
        <div className="space-y-2">
          {hours.map((hour) => {
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;
            const nextHourStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

            const activeInHour = timeBlocks.filter((b) => {
              return b.startTime <= hourStr && b.endTime > hourStr;
            });

            return (
              <div key={hour} className="group flex items-start gap-4 min-h-[44px]">
                <div className="w-14 text-right text-xs font-mono text-white/30 pt-0.5 shrink-0">
                  {hourStr}
                </div>

                <div className="flex-1 border-t border-[#2E2E2E] pt-1 pb-1">
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
                            className="flex items-center justify-between rounded-lg bg-[#232323] border border-[#00C2CB]/50 text-white px-3 py-1.5 shadow-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Clock className="h-3.5 w-3.5 text-[#00C2CB] shrink-0" />
                              <span className="text-xs font-semibold truncate">{taskName}</span>
                              <span className="text-[10px] text-white/50">
                                ({block.startTime} - {block.endTime}) · {goalName}
                              </span>
                            </div>

                            <button
                              onClick={() => onDeleteTimeBlock(block.id)}
                              className="text-white/40 hover:text-rose-400 ml-2"
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
                      className="h-6 w-full rounded hover:bg-[#232323]/50 transition-colors cursor-pointer flex items-center px-2 text-[10px] text-white/20 opacity-0 group-hover:opacity-100"
                    >
                      + Schedule {hourStr}
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
