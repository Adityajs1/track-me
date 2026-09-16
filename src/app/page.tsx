'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { GoalData, TaskData, TimeBlockData, NoteData } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { GoalsView } from '@/components/GoalsView';
import { DailyCheckin } from '@/components/DailyCheckin';
import { GoalDetailView } from '@/components/GoalDetailView';
import { TimeBlockingView } from '@/components/TimeBlockingView';
import { NotesView } from '@/components/NotesView';
import { InAppReminderBanner } from '@/components/InAppReminderBanner';
import { CreateGoalModal } from '@/components/Modal';
import { LandingHero } from '@/components/LandingHero';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'goals' | 'checkin' | 'timeblock' | 'notes'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
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
    setActiveTab('goals');
  };

  // If landing page is active
  if (showLanding) {
    return <LandingHero onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white flex font-sans selection:bg-[#FF4FA3] selection:text-white">
      {/* Notion-style Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedGoal(null);
          setActiveTab(tab);
        }}
        goals={goals}
        selectedGoalId={selectedGoal?.id || null}
        onSelectGoal={handleSelectGoal}
        onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
        totalPoints={totalPoints}
        activeStreak={activeStreak}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top subtle reminder banner */}
        {showReminders && (
          <InAppReminderBanner
            timeBlocks={timeBlocks}
            tasks={dailyTasks}
            onDismiss={() => setShowReminders(false)}
          />
        )}

        <main className="flex-1 px-6 sm:px-10 py-8">
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
              {activeTab === 'goals' && (
                <GoalsView
                  goals={goals}
                  onSelectGoal={handleSelectGoal}
                  onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {activeTab === 'checkin' && (
                <DailyCheckin
                  tasks={dailyTasks}
                  goals={goals}
                  onToggleTask={handleToggleTask}
                  onSelectGoal={handleSelectGoal}
                />
              )}

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
