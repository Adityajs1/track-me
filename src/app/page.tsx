'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { GoalData, TaskData, TimeBlockData, NoteData } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { GoalCard } from '@/components/GoalCard';
import { DailyCheckin } from '@/components/DailyCheckin';
import { GoalDetailView } from '@/components/GoalDetailView';
import { TimeBlockingView } from '@/components/TimeBlockingView';
import { NotesView } from '@/components/NotesView';
import { InAppReminderBanner } from '@/components/InAppReminderBanner';
import { CreateGoalModal } from '@/components/Modal';
import { LandingHero } from '@/components/LandingHero';
import { format } from 'date-fns';
import { Plus, Target, Flame, Sparkles, Filter, ArrowRight } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'goals' | 'checkin' | 'timeblock' | 'notes'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showReminders, setShowReminders] = useState(true);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // SWR data hooks
  const { data: goals = [], mutate: mutateGoals } = useSWR<GoalData[]>('/api/goals', fetcher);
  const { data: dailyTasks = [], mutate: mutateTasks } = useSWR<TaskData[]>(
    `/api/tasks?date=${dateStr}`,
    fetcher
  );
  const { data: timeBlocks = [], mutate: mutateBlocks } = useSWR<TimeBlockData[]>(
    `/api/timeblocks?date=${dateStr}`,
    fetcher
  );
  const { data: notes = [], mutate: mutateNotes } = useSWR<NoteData[]>('/api/notes', fetcher);

  // Computed overall metrics across all goals
  const totalPoints = goals.reduce((acc, g) => acc + (g.metrics?.totalPoints || 0), 0);
  const activeStreak = goals.reduce((max, g) => Math.max(max, g.metrics?.currentStreak || 0), 0);

  // Dynamic user-defined categories
  const categories = Array.from(new Set(goals.map((g) => g.category)));
  const filteredGoals =
    selectedCategory === 'all'
      ? goals
      : goals.filter((g) => g.category === selectedCategory);

  // Handlers
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
      mutateGoals();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSelectedGoal(null);
      mutateGoals();
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<GoalData>) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      mutateGoals();
    }
  };

  const handleToggleTask = async (taskId: string, done: boolean) => {
    const res = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, done }),
    });
    if (res.ok) {
      mutateTasks();
      mutateGoals();
      if (selectedGoal) {
        const updatedGoalRes = await fetch(`/api/goals/${selectedGoal.id}`);
        if (updatedGoalRes.ok) {
          setSelectedGoal(await updatedGoalRes.json());
        }
      }
    }
  };

  const handleAddPlan = async (goalId: string, name: string, startDate: string, endDate: string) => {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, name, startDate, endDate }),
    });
    if (res.ok) {
      mutateGoals();
      if (selectedGoal) {
        const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
        setSelectedGoal(updated);
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const res = await fetch(`/api/plans/${planId}`, { method: 'DELETE' });
    if (res.ok) {
      mutateGoals();
      if (selectedGoal) {
        const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
        setSelectedGoal(updated);
      }
    }
  };

  const handleAddTask = async (taskData: Partial<TaskData>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (res.ok) {
      mutateTasks();
      mutateGoals();
      if (selectedGoal) {
        const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
        setSelectedGoal(updated);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) {
      mutateTasks();
      mutateGoals();
      if (selectedGoal) {
        const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
        setSelectedGoal(updated);
      }
    }
  };

  const handleCreateTimeBlock = async (block: {
    taskId?: string;
    taskInstanceId?: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    const res = await fetch('/api/timeblocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block),
    });
    if (res.ok) {
      mutateBlocks();
    }
  };

  const handleDeleteTimeBlock = async (id: string) => {
    const res = await fetch(`/api/timeblocks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      mutateBlocks();
    }
  };

  const handleCreateNote = async (
    noteOrGoalId: { goalId: string | null; title: string; content: string } | string | null,
    maybeTitle?: string,
    maybeContent?: string
  ) => {
    let payload;
    if (typeof noteOrGoalId === 'object' && noteOrGoalId !== null) {
      payload = noteOrGoalId;
    } else {
      payload = {
        goalId: noteOrGoalId || null,
        title: maybeTitle || '',
        content: maybeContent || '',
      };
    }

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      mutateNotes();
      if (selectedGoal) {
        const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
        setSelectedGoal(updated);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      mutateNotes();
      if (selectedGoal) {
        const updated = await fetch(`/api/goals/${selectedGoal.id}`).then((r) => r.json());
        setSelectedGoal(updated);
      }
    }
  };

  const handleSelectGoal = async (g: GoalData) => {
    const res = await fetch(`/api/goals/${g.id}`);
    if (res.ok) {
      setSelectedGoal(await res.json());
    } else {
      setSelectedGoal(g);
    }
  };

  // If landing page is active
  if (showLanding) {
    return <LandingHero onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white flex flex-col font-sans selection:bg-[#FF4FA3] selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedGoal(null);
          setActiveTab(tab);
        }}
        onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
        totalPoints={totalPoints}
        activeStreak={activeStreak}
        unreadRemindersCount={timeBlocks.length}
        onToggleReminders={() => setShowReminders(!showReminders)}
      />

      {/* In-app reminder banner */}
      {showReminders && (
        <InAppReminderBanner
          timeBlocks={timeBlocks}
          tasks={dailyTasks}
          onDismiss={() => setShowReminders(false)}
        />
      )}

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {selectedGoal ? (
          <GoalDetailView
            goal={selectedGoal}
            onBack={() => setSelectedGoal(null)}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddPlan={handleAddPlan}
            onDeletePlan={handleDeletePlan}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onAddNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <>
            {/* Tab: Goals & Habits Overview */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                {/* Header with quick back to landing & new goal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-white">
                        Active Goals & Habits
                      </h1>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#232323] text-[#00C2CB] border border-[#2E2E2E]">
                        {goals.length} active
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      Tracking consistency per goal over time rather than daily pass or fail.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setShowLanding(true)}
                      className="text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-[#2E2E2E] bg-[#232323] transition-colors"
                    >
                      ← Landing View
                    </button>
                    <button
                      onClick={() => setIsNewGoalModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-4 py-2 text-xs font-bold text-[#1B1B1B] shadow-sm hover:bg-white hover:text-[#1B1B1B] transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>New Goal</span>
                    </button>
                  </div>
                </div>

                {/* Category Filters */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-xs text-white/40 mr-1 flex items-center gap-1">
                      <Filter className="h-3 w-3" /> Filter:
                    </span>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-[#00C2CB] text-[#1B1B1B] font-bold'
                          : 'bg-[#232323] text-white/70 hover:bg-[#2E2E2E] hover:text-white border border-[#2E2E2E]'
                      }`}
                    >
                      All ({goals.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === cat
                            ? 'bg-[#00C2CB] text-[#1B1B1B] font-bold'
                            : 'bg-[#232323] text-white/70 hover:bg-[#2E2E2E] hover:text-white border border-[#2E2E2E]'
                        }`}
                      >
                        {cat} ({goals.filter((g) => g.category === cat).length})
                      </button>
                    ))}
                  </div>
                )}

                {/* Goals Grid */}
                {filteredGoals.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#2E2E2E] bg-[#232323]/40 p-12 text-center">
                    <Target className="mx-auto h-12 w-12 text-white/20 mb-4" />
                    <h3 className="text-base font-semibold text-white">
                      No goals created yet
                    </h3>
                    <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                      Create your first goal to begin tracking habits, structured phases, and consistency heatmaps.
                    </p>
                    <button
                      onClick={() => setIsNewGoalModalOpen(true)}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-4 py-2 text-xs font-bold text-[#1B1B1B]"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Add First Goal</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onSelect={handleSelectGoal}
                        onDelete={handleDeleteGoal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Daily Check-in */}
            {activeTab === 'checkin' && (
              <DailyCheckin
                tasks={dailyTasks}
                goals={goals}
                onToggleTask={handleToggleTask}
                onSelectGoal={handleSelectGoal}
              />
            )}

            {/* Tab: Time-Blocking Calendar */}
            {activeTab === 'timeblock' && (
              <TimeBlockingView
                tasks={dailyTasks}
                timeBlocks={timeBlocks}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onCreateTimeBlock={handleCreateTimeBlock}
                onDeleteTimeBlock={handleDeleteTimeBlock}
              />
            )}

            {/* Tab: Reflection Journal */}
            {activeTab === 'notes' && (
              <NotesView
                notes={notes}
                goals={goals}
                onCreateNote={handleCreateNote}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </>
        )}
      </main>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        onCreateGoal={handleCreateGoal}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2E2E2E] bg-[#1B1B1B] py-6 text-center text-xs text-white/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ziffy. — Organise your way</span>
          <span className="text-[#00C2CB]">Effort as a trend</span>
        </div>
      </footer>
    </div>
  );
}
