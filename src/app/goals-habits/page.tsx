'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { GoalData, TaskData } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { GoalDetailView } from '@/components/GoalDetailView';
import { CreateGoalModal } from '@/components/Modal';
import {
  Target,
  Repeat,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Filter,
  Flame,
  CheckSquare,
  Square,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  Trash2,
  Loader2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GoalsAndHabitsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'goals' | 'habits'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [goalFilter, setGoalFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Habit Creation state
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitGoalId, setNewHabitGoalId] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('daily');
  const [isSubmittingHabit, setIsSubmittingHabit] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Fetch Goals and Daily Tasks (Habits)
  const { data: goals = [], mutate: mutateGoals, isLoading: goalsLoading } = useSWR<GoalData[]>(
    user ? '/api/goals' : null,
    fetcher
  );

  const { data: dailyTasks = [], mutate: mutateTasks, isLoading: tasksLoading } = useSWR<TaskData[]>(
    user ? `/api/tasks?date=${todayStr}` : null,
    fetcher
  );

  // Overall metrics
  const totalPoints = goals.reduce((acc, g) => acc + (g.metrics?.totalPoints || 0), 0);
  const activeStreak = goals.reduce((max, g) => Math.max(max, g.metrics?.currentStreak || 0), 0);

  // Separate recurring habits from milestone tasks
  const habits = dailyTasks.filter((t) => t.isRecurring);

  // Handlers for Goal operations
  const handleCreateGoal = async (goalInput: {
    name: string;
    category: string;
    startDate: string;
    endDate?: string;
  }) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalInput),
    });
    if (res.ok) {
      await mutateGoals();
    }
  };

  const handleToggleGoalCompletion = async (goal: GoalData, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !goal.isCompleted;

    // Optimistic update
    mutateGoals(
      goals.map((g) =>
        g.id === goal.id ? { ...g, isCompleted: newStatus, completedAt: newStatus ? new Date().toISOString() : null } : g
      ),
      false
    );

    const res = await fetch(`/api/goals/${goal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: newStatus }),
    });

    if (res.ok) {
      await mutateGoals();
      if (selectedGoal && selectedGoal.id === goal.id) {
        setSelectedGoal(await res.json());
      }
    } else {
      await mutateGoals();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSelectedGoal(null);
      await mutateGoals();
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<GoalData>) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await mutateGoals();
    }
  };

  // Habit operations
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim() || !newHabitGoalId) return;

    setIsSubmittingHabit(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: newHabitGoalId,
          title: newHabitTitle.trim(),
          isRecurring: true,
          frequency: newHabitFrequency,
        }),
      });
      if (res.ok) {
        setNewHabitTitle('');
        setIsCreatingHabit(false);
        await mutateTasks();
        await mutateGoals();
      }
    } finally {
      setIsSubmittingHabit(false);
    }
  };

  const handleToggleHabit = async (habitId: string, currentDone: boolean) => {
    const res = await fetch(`/api/tasks/${habitId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayStr, done: !currentDone }),
    });
    if (res.ok) {
      await mutateTasks();
      await mutateGoals();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) {
      await mutateTasks();
      await mutateGoals();
    }
  };

  // Filtered Goals
  const filteredGoals = goals.filter((g) => {
    if (goalFilter === 'active' && g.isCompleted) return false;
    if (goalFilter === 'completed' && !g.isCompleted) return false;
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    return true;
  });

  const categories = Array.from(new Set(goals.map((g) => g.category)));
  const completedGoalsCount = goals.filter((g) => g.isCompleted).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* App Header with 3-line menu, Ziffy logo, and user stats */}
      <AppHeader
        onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
        totalPoints={totalPoints}
        activeStreak={activeStreak}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto space-y-6">
          {selectedGoal ? (
            <GoalDetailView
              goal={selectedGoal}
              onBack={() => setSelectedGoal(null)}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddPlan={async (goalId, name, startDate, endDate) => {
                await fetch('/api/plans', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ goalId, name, startDate, endDate }),
                });
                await mutateGoals();
                const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
                setSelectedGoal(updated);
              }}
              onDeletePlan={async (planId) => {
                await fetch(`/api/plans/${planId}`, { method: 'DELETE' });
                await mutateGoals();
                const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
                setSelectedGoal(updated);
              }}
              onAddTask={async (taskData) => {
                await fetch('/api/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(taskData),
                });
                await mutateGoals();
                const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
                setSelectedGoal(updated);
              }}
              onDeleteTask={handleDeleteTask}
              onToggleTask={async (taskId, done) => {
                await fetch(`/api/tasks/${taskId}/toggle`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ date: todayStr, done }),
                });
                await mutateTasks();
                await mutateGoals();
                const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
                setSelectedGoal(updated);
              }}
              onAddNote={async (payload) => {
                await fetch('/api/notes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                await mutateGoals();
                const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
                setSelectedGoal(updated);
              }}
              onDeleteNote={async (id) => {
                await fetch(`/api/notes/${id}`, { method: 'DELETE' });
                await mutateGoals();
                const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
                setSelectedGoal(updated);
              }}
            />
          ) : (
            <>
              {/* Page Title & Tab Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Target className="h-7 w-7 text-white" />
                    <span>Goals & Habits</span>
                  </h1>
                  <p className="text-xs text-white/50 mt-1">
                    Manage overarching milestone goals and recurring daily habits.
                  </p>
                </div>

                {/* Switcher Tabs: Goals vs Habits */}
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10 text-xs">
                    <button
                      onClick={() => setActiveTab('goals')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activeTab === 'goals'
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Goals ({goals.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('habits')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activeTab === 'habits'
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      <span>Habits ({habits.length})</span>
                    </button>
                  </div>

                  {activeTab === 'goals' ? (
                    <button
                      onClick={() => setIsNewGoalModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2]" />
                      <span>New Goal</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsCreatingHabit(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2]" />
                      <span>New Habit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: GOALS SECTION */}
              {activeTab === 'goals' && (
                <div className="space-y-6">
                  {/* Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 font-mono uppercase text-[10px] tracking-wider">
                        Status:
                      </span>
                      <button
                        onClick={() => setGoalFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          goalFilter === 'all'
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-white/60 hover:text-white'
                        }`}
                      >
                        All ({goals.length})
                      </button>
                      <button
                        onClick={() => setGoalFilter('active')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          goalFilter === 'active'
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-white/60 hover:text-white'
                        }`}
                      >
                        Active ({goals.length - completedGoalsCount})
                      </button>
                      <button
                        onClick={() => setGoalFilter('completed')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          goalFilter === 'completed'
                            ? 'bg-white text-black font-semibold'
                            : 'bg-white/[0.04] text-white/60 hover:text-white'
                        }`}
                      >
                        Completed ({completedGoalsCount})
                      </button>
                    </div>

                    {categories.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 font-mono uppercase text-[10px] tracking-wider">
                          Category:
                        </span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="rounded-lg border border-white/10 bg-[#161616] px-2.5 py-1 text-xs text-white"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Goals Grid */}
                  {filteredGoals.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
                      <Target className="h-8 w-8 text-white/20 mx-auto" />
                      <p className="text-xs text-white/40">
                        {goals.length === 0
                          ? 'No goals created yet. Click "New Goal" to establish your first milestone.'
                          : 'No goals match the selected filter.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredGoals.map((g) => {
                        const isDone = Boolean(g.isCompleted);
                        return (
                          <div
                            key={g.id}
                            onClick={() => setSelectedGoal(g)}
                            className={`glass-panel rounded-2xl p-5 hover:border-white/20 transition-all cursor-pointer relative group ${
                              isDone ? 'border-white/20 bg-white/[0.02]' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-white/10 text-white/60">
                                    {g.category}
                                  </span>
                                  {isDone && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white border border-white/20">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Completed</span>
                                    </span>
                                  )}
                                </div>
                                <h3 className={`text-base font-bold truncate mt-1 ${isDone ? 'text-white/60 line-through' : 'text-white'}`}>
                                  {g.name}
                                </h3>
                              </div>

                              {/* Black & White Completion Indicator Button */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleGoalCompletion(g, e)}
                                title={isDone ? 'Mark as active / re-open' : 'Mark goal as completed'}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                  isDone
                                    ? 'bg-white text-black hover:bg-white/90'
                                    : 'bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white border border-white/10'
                                }`}
                              >
                                <CheckCircle2 className={`h-4 w-4 ${isDone ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                                <span className="hidden sm:inline">{isDone ? 'Done ✓' : 'Complete'}</span>
                              </button>
                            </div>

                            {/* Details and Metrics */}
                            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                              <div className="flex items-center gap-3">
                                <span>{g._count?.plans || 0} phases</span>
                                <span>•</span>
                                <span>{g._count?.tasks || 0} tasks</span>
                              </div>
                              {g.completedAt && (
                                <span className="font-mono text-white/60">
                                  Completed {format(new Date(g.completedAt), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: RECURRING HABITS SECTION */}
              {activeTab === 'habits' && (
                <div className="space-y-6">
                  {/* Create Habit Inline Form */}
                  {isCreatingHabit && (
                    <form
                      onSubmit={handleCreateHabit}
                      className="glass-panel rounded-2xl p-5 space-y-4 border border-white/20"
                    >
                      <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                        Add New Recurring Habit
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-mono text-white/70 mb-1">
                            Habit Name
                          </label>
                          <input
                            type="text"
                            required
                            autoFocus
                            value={newHabitTitle}
                            onChange={(e) => setNewHabitTitle(e.target.value)}
                            placeholder="e.g. 30m LeetCode, Morning Meditation, Drink 2L water"
                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/70 mb-1">
                            Associated Goal
                          </label>
                          <select
                            required
                            value={newHabitGoalId}
                            onChange={(e) => setNewHabitGoalId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#161616] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
                          >
                            <option value="">-- Select Goal --</option>
                            {goals.map((g) => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsCreatingHabit(false)}
                          className="px-3 py-1.5 text-xs text-white/50 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingHabit}
                          className="rounded-xl bg-white hover:bg-white/90 text-black px-4 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          {isSubmittingHabit ? 'Creating...' : 'Create Habit'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Habits List */}
                  {habits.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
                      <Repeat className="h-8 w-8 text-white/20 mx-auto" />
                      <p className="text-xs text-white/40">
                        No recurring habits created yet. Click &ldquo;New Habit&rdquo; to build daily routines.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {habits.map((h) => {
                        const isDoneToday = Boolean((h as any).isDoneToday || h.done);
                        return (
                          <div
                            key={h.id}
                            className="glass-panel rounded-xl p-4 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <button
                                onClick={() => handleToggleHabit(h.id, isDoneToday)}
                                className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                  isDoneToday
                                    ? 'bg-white text-black shadow-xs'
                                    : 'border border-white/20 hover:border-white text-transparent'
                                }`}
                              >
                                {isDoneToday && <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />}
                              </button>

                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold truncate ${isDoneToday ? 'line-through text-white/50' : 'text-white'}`}>
                                    {h.title}
                                  </span>
                                  {h.goal?.name && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/50 font-mono">
                                      {h.goal.name}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-white/40 mt-0.5">
                                  Frequency: {h.frequency || 'Daily'} · Recorded to productivity heatmap
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteTask(h.id)}
                              className="text-white/30 hover:text-white p-1.5 transition-colors cursor-pointer"
                              title="Delete habit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
}
