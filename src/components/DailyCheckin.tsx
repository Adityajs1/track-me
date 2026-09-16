'use client';

import React, { useState } from 'react';
import { TaskData, GoalData } from '@/lib/types';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Sparkles, Repeat, Calendar, ArrowRight, CheckSquare, Square } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl mx-auto text-white">
      {/* Page Header (Notion Style) */}
      <div className="pb-4 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
          <span>Ziffy</span>
          <span>/</span>
          <span className="text-white">Daily Check-in</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] border border-[#2E2E2E] text-[#FF4FA3]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Daily Check-in
              </h1>
              <p className="text-xs text-white/50 mt-0.5">{todayStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1F1F1F] px-3.5 py-1.5 rounded-xl border border-[#2E2E2E] text-xs font-semibold">
            <Sparkles className="h-4 w-4 text-[#FF4FA3]" />
            <span className="text-white">+{earnedPoints} pts today</span>
          </div>
        </div>
      </div>

      {/* Progress Summary Card */}
      <div className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3">
        <div className="flex justify-between items-center text-xs text-white/70">
          <span>
            {completedTasks} of {totalTasks} items completed
          </span>
          <span className="font-bold text-white">{Math.round(completionRate)}%</span>
        </div>

        <div className="h-2 w-full rounded-full bg-[#161616] overflow-hidden border border-[#2E2E2E]">
          <div
            className="h-full bg-gradient-to-r from-[#00C2CB] to-[#FF4FA3] transition-all duration-300 rounded-full"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {completionRate >= 80 && totalTasks > 0 && (
          <p className="text-xs text-[#00C2CB] font-semibold pt-1">
            ✨ Consistency goal achieved! +25 bonus points earned today for maintaining $\ge 80\%$ daily completion.
          </p>
        )}
      </div>

      {/* Task List Grouped by Goal */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2E2E2E] bg-[#1F1F1F]/40 p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-white/20 mb-3" />
          <h3 className="text-sm font-semibold text-white">
            No habits or tasks scheduled for today
          </h3>
          <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
            Recurring habits and tasks scheduled for today will automatically appear here.
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
                className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 shadow-sm"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2E2E2E]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#161616] text-[#00C2CB] border border-[#2E2E2E]">
                      {goalCategory}
                    </span>
                    <h3 className="text-sm font-bold text-white">{goalName}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/50">
                      {goalCompleted}/{goalTasks.length} ({goalRate}%)
                    </span>
                    {onSelectGoal && goal && (
                      <button
                        onClick={() => onSelectGoal(goal as GoalData)}
                        className="text-white/60 hover:text-white flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Checklist rows */}
                <div className="space-y-1.5">
                  {goalTasks.map((task) => {
                    const isDone = (task as any).isDoneToday || task.done;
                    const isLoading = loadingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        onClick={() => !isLoading && handleToggle(task)}
                        className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-[#161616]/50 border-[#2E2E2E] opacity-60'
                            : 'bg-[#232323] border-[#2E2E2E] hover:border-[#00C2CB]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            disabled={isLoading}
                            className={`transition-colors ${
                              isDone
                                ? 'text-[#00C2CB]'
                                : 'text-white/40 group-hover:text-white'
                            }`}
                          >
                            {isDone ? (
                              <CheckSquare className="h-4 w-4 text-[#00C2CB]" />
                            ) : (
                              <Square className="h-4 w-4" />
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
                              <span className="ml-2 text-[10px] text-white/40">
                                · {task.plan.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/40">
                          {task.isRecurring ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-[#161616] px-2 py-0.5 rounded text-white/60 border border-[#2E2E2E]">
                              <Repeat className="h-3 w-3 text-[#00C2CB]" />
                              Daily habit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                              <Calendar className="h-3 w-3 text-[#FF4FA3]" />
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
