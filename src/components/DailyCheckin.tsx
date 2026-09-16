'use client';

import React, { useState } from 'react';
import { TaskData, GoalData } from '@/lib/types';
import { format } from 'date-fns';
import { CheckCircle2, Repeat, Calendar, ArrowRight, CheckSquare, Square, Sparkles } from 'lucide-react';

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

  // Dynamic calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => (t as any).isDoneToday || t.done).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const earnedPoints = completedTasks * 10 + (completionRate >= 80 && totalTasks > 0 ? 25 : 0);

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
    <div className="space-y-8 max-w-4xl mx-auto text-white">
      {/* Page Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/40 mb-2 font-mono">
          <span>ziffy</span>
          <span>/</span>
          <span className="text-white">Daily Check-in</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Daily Check-in
            </h1>
            <p className="text-sm text-white/50 mt-1">{todayStr}</p>
          </div>

          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-xl text-xs font-mono self-start sm:self-auto">
            <Sparkles className="h-4 w-4 text-white/80 stroke-[1.5]" />
            <span className="text-white font-semibold">+{earnedPoints} pts earned today</span>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-white/60">
            {completedTasks} of {totalTasks} items completed today
          </span>
          <span className="font-semibold text-white">{Math.round(completionRate)}%</span>
        </div>

        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden border border-white/10">
          <div
            className="h-full bg-white transition-all duration-300 rounded-full"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {completionRate >= 80 && totalTasks > 0 && (
          <p className="text-xs text-white/90 font-medium pt-1">
            ✨ Consistency achieved! +25 bonus points earned today for maintaining $\ge 80\%$ daily completion.
          </p>
        )}
      </div>

      {/* Task List Grouped by Goal */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-white/20 mb-4 stroke-[1.25]" />
          <h3 className="text-base font-semibold text-white">
            No habits or tasks scheduled for today
          </h3>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto leading-relaxed">
            Create recurring daily habits or scheduled tasks inside your goals. They will automatically appear here for daily check-in.
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
                className="glass-panel rounded-2xl p-5 shadow-sm space-y-3"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/[0.05] text-white/80 border border-white/10">
                      {goalCategory}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{goalName}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/40 font-mono">
                      {goalCompleted}/{goalTasks.length} ({goalRate}%)
                    </span>
                    {onSelectGoal && goal && (
                      <button
                        onClick={() => onSelectGoal(goal as GoalData)}
                        className="text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3 stroke-[1.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Checklist rows */}
                <div className="space-y-2">
                  {goalTasks.map((task) => {
                    const isDone = (task as any).isDoneToday || task.done;
                    const isLoading = loadingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        onClick={() => !isLoading && handleToggle(task)}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-white/[0.015] border-white/5 opacity-50'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            disabled={isLoading}
                            className={`transition-colors ${
                              isDone
                                ? 'text-white'
                                : 'text-white/40 group-hover:text-white'
                            }`}
                          >
                            {isDone ? (
                              <CheckSquare className="h-4 w-4 stroke-[1.75]" />
                            ) : (
                              <Square className="h-4 w-4 stroke-[1.5]" />
                            )}
                          </button>

                          <div>
                            <span
                              className={`text-xs font-medium ${
                                isDone ? 'line-through text-white/40' : 'text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.plan && (
                              <span className="ml-2 text-[10px] text-white/40 font-mono">
                                · {task.plan.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/40">
                          {task.isRecurring ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-white/[0.04] px-2 py-0.5 rounded text-white/60 border border-white/10 font-mono">
                              <Repeat className="h-3 w-3 stroke-[1.5]" />
                              Daily habit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-white/40 font-mono">
                              <Calendar className="h-3 w-3 stroke-[1.5]" />
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
