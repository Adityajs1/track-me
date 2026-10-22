'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import useSWR from 'swr';
import { GoalData, TaskData } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { TimeBlockingView } from '@/components/TimeBlockingView';
import { CreateGoalModal } from '@/components/Modal';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TimeBlockingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Load goals and daily tasks for linking
  const { data: goals = [], mutate: mutateGoals } = useSWR<GoalData[]>(
    user ? '/api/goals' : null,
    fetcher
  );
  const { data: dailyTasks = [] } = useSWR<TaskData[]>(
    user ? `/api/tasks?date=${dateStr}` : null,
    fetcher
  );

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/time-blocking');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white mb-3" />
        <p className="text-xs text-white/50 font-mono">Authenticating session...</p>
      </div>
    );
  }

  const totalPoints = goals.reduce((acc, g) => acc + (g.metrics?.totalPoints || 0), 0);
  const activeStreak = goals.reduce((max, g) => Math.max(max, g.metrics?.currentStreak || 0), 0);

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-white selection:text-black">
      {/* Sidebar with activeTab highlighting */}
      <Sidebar
        activeTab="timeblock"
        setActiveTab={() => {}}
        goals={goals}
        selectedGoalId={null}
        onSelectGoal={(g) => router.push(`/goals-habits?goal=${g.id}`)}
        onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
        onOpenLanding={() => router.push('/')}
        totalPoints={totalPoints}
        activeStreak={activeStreak}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
          <TimeBlockingView
            tasks={dailyTasks}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
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
