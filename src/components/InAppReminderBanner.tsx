'use client';

import React, { useState } from 'react';
import { TaskData, TimeBlockData } from '@/lib/types';
import { Bell, Clock, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface InAppReminderBannerProps {
  timeBlocks: TimeBlockData[];
  tasks: TaskData[];
  onDismiss?: () => void;
}

export const InAppReminderBanner: React.FC<InAppReminderBannerProps> = ({
  timeBlocks,
  tasks,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Find upcoming scheduled time blocks
  const now = new Date();
  const currentHourStr = format(now, 'HH:mm');

  const upcomingBlocks = timeBlocks.filter((b) => b.endTime >= currentHourStr);
  const uncompletedTasksCount = tasks.filter((t) => !(t as any).isDoneToday && !t.done).length;

  if (upcomingBlocks.length === 0 && uncompletedTasksCount === 0) {
    return null;
  }

  const nextBlock = upcomingBlocks[0];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
            <Bell className="h-4 w-4" />
          </div>

          <div className="text-xs text-zinc-700 dark:text-zinc-300">
            {nextBlock ? (
              <span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Scheduled Focus:
                </span>{' '}
                &ldquo;{nextBlock.task?.title || nextBlock.taskInstance?.task?.title}&rdquo; from{' '}
                <span className="font-medium">{nextBlock.startTime} to {nextBlock.endTime}</span>.
              </span>
            ) : (
              <span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Daily Check-in Reminder:
                </span>{' '}
                You have {uncompletedTasksCount} task{uncompletedTasksCount === 1 ? '' : 's'} to review today.
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setDismissed(true);
            if (onDismiss) onDismiss();
          }}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 self-end sm:self-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
