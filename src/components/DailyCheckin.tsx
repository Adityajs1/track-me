'use client';

import React, { useState } from 'react';
import { TaskData, GoalData } from '@/lib/types';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Sparkles, Repeat, Calendar, ArrowRight } from 'lucide-react';

interface DailyCheckinProps {
  tasks: TaskData[];
  goals: GoalData[];
  onToggleTask: (taskId: string, isDone: boolean) => Promise<void>;
  onSelectGoal?: (goal: GoalData) => void;
}

export const DailyCheckin: React.FC<DailyCheckinProps> = ({
  tasks,
  goals,
  onToggleTask,
  onSelectGoal,
}) => {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const todayStr = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Compute stats for today
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => (t as any).isDoneToday || t.done).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const earnedPoints = completedTasks * 10 + (completionRate >= 80 ? 25 : 0);

  // Group tasks by goal
  const groupedTasks: Record<string, TaskData[]> = {};
  tasks.forEach((t) => {
    const gId = t.goalId;
    if (!groupedTasks[gId]) {
      groupedTasks[gId] = [];
    }
    groupedTasks[gId].push(t);
  });

  const handleToggle = async (task: TaskData) => {
    const isDone = (task as any).isDoneToday || task.done;
    setLoadingTaskId(task.id);
    try {
      await onToggleTask(task.id, !isDone);
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Today Header & Progress */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Daily Check-in
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
              {todayStr}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{earnedPoints} pts today</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Rate */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span>
              {completedTasks} of {totalTasks} completed
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              {Math.round(completionRate)}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                completionRate >= 80
                  ? 'bg-emerald-600 dark:bg-emerald-500'
                  : completionRate >= 30
                  ? 'bg-amber-500'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {completionRate >= 80 && totalTasks > 0 && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium pt-1">
              ✨ Great job! You hit the 80%+ consistency threshold for today (+25 bonus points earned).
            </p>
          )}
        </div>
      </div>

      {/* Task List Grouped by Goal */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No tasks or habits scheduled for today
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            You can create recurring daily habits or schedule target-date tasks under your goals.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([goalId, goalTasks]) => {
            const goal = goals.find((g) => g.id === goalId) || goalTasks[0]?.goal;
            const goalName = goal?.name || 'Goal';
            const goalCategory = goal?.category || 'General';

            const goalCompleted = goalTasks.filter((t) => (t as any).isDoneToday || t.done).length;
            const goalRate = Math.round((goalCompleted / goalTasks.length) * 100);

            return (
              <div
                key={goalId}
                className="rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/40 p-4 shadow-xs"
              >
                {/* Goal Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {goalCategory}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {goalName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {goalCompleted}/{goalTasks.length} ({goalRate}%)
                    </span>
                    {onSelectGoal && goal && (
                      <button
                        onClick={() => onSelectGoal(goal as GoalData)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tasks under this goal */}
                <div className="space-y-2">
                  {goalTasks.map((task) => {
                    const isDone = (task as any).isDoneToday || task.done;
                    const isLoading = loadingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        onClick={() => !isLoading && handleToggle(task)}
                        className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-zinc-50/70 border-zinc-200/50 dark:bg-zinc-900/30 dark:border-zinc-800/40 opacity-80'
                            : 'bg-white border-zinc-200/90 dark:bg-zinc-900/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            disabled={isLoading}
                            className={`transition-colors ${
                              isDone
                                ? 'text-emerald-600 dark:text-emerald-500'
                                : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>

                          <div>
                            <span
                              className={`text-sm font-medium ${
                                isDone
                                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                                  : 'text-zinc-900 dark:text-zinc-100'
                              }`}
                            >
                              {task.title}
                            </span>

                            {task.plan && (
                              <span className="ml-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                                · {task.plan.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          {task.isRecurring ? (
                            <span className="flex items-center gap-1 text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                              <Repeat className="h-3 w-3" />
                              Daily habit
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Calendar className="h-3 w-3" />
                              One-off
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
