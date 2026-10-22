'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { GoalData, TaskData, NoteData } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { GoalsView } from '@/components/GoalsView';
import { DailyCheckin } from '@/components/DailyCheckin';
import { GoalDetailView } from '@/components/GoalDetailView';
import { TimeBlockingView } from '@/components/TimeBlockingView';
import { NotesView } from '@/components/NotesView';
import { CreateGoalModal } from '@/components/Modal';
import { LandingHero } from '@/components/LandingHero';
import { format } from 'date-fns';
import { Calendar, Lock, ArrowRight } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'goals' | 'checkin' | 'timeblock' | 'notes'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // SWR data hooks
  const { data: goals = [], mutate: mutateGoals } = useSWR<GoalData[]>('/api/goals', fetcher);
  const { data: dailyTasks = [], mutate: mutateTasks } = useSWR<TaskData[]>(
    `/api/tasks?date=${dateStr}`,
    fetcher
  );
  const { data: notes = [], mutate: mutateNotes } = useSWR<NoteData[]>('/api/notes', fetcher);

  // Check URL query parameters for tab navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as 'goals' | 'checkin' | 'timeblock' | 'notes' | null;
      if (tabParam && ['goals', 'checkin', 'timeblock', 'notes'].includes(tabParam)) {
        setActiveTab(tabParam);
        setShowLanding(false);
      }
    }
  }, []);

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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-[#FF4FA3] selection:text-white">
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
        <main className="flex-1 px-4 sm:px-8 py-6">
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
                user ? (
                  <TimeBlockingView
                    tasks={dailyTasks}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                ) : (
                  <div className="max-w-xl mx-auto my-12 glass-panel rounded-2xl p-8 text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 text-[#00C2CB]">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Sign in to Access Time-Blocking
                    </h2>
                    <p className="text-xs text-white/50 max-w-sm mx-auto">
                      Your time-blocking schedule is dynamically saved and encrypted to your personal user account with zero hardcoded data.
                    </p>
                    <button
                      onClick={() => router.push('/login?redirect=/timeblocking')}
                      className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-white/90 text-black px-5 py-2.5 text-xs font-semibold shadow-md transition-all cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Sign In to Continue</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
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
