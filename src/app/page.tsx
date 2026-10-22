'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { GoalData, TaskData, NoteData, ProductivityOverviewData, DailyCheckInData, TimeBlockData } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { ProductivityHeatmap } from '@/components/ProductivityHeatmap';
import { CreateGoalModal } from '@/components/Modal';
import { LandingHero } from '@/components/LandingHero';
import { format } from 'date-fns';
import {
  LayoutDashboard,
  Target,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
  Flame,
  Plus,
  Check,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [showLanding, setShowLanding] = useState(!user);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Load Goals
  const { data: goals = [], mutate: mutateGoals } = useSWR<GoalData[]>(
    user ? '/api/goals' : null,
    fetcher
  );

  // Load Productivity Heatmap Data (Unified across goals, habits, check-ins)
  const { data: heatmapData, mutate: mutateHeatmap } = useSWR<ProductivityOverviewData>(
    user ? '/api/productivity/heatmap?days=90' : null,
    fetcher
  );

  // Load today's check-in
  const { data: todayCheckIn } = useSWR<DailyCheckInData | null>(
    user ? `/api/checkins?date=${todayStr}` : null,
    fetcher
  );

  // Load today's time blocks
  const { data: todayBlocks = [] } = useSWR<TimeBlockData[]>(
    user ? `/api/timeblocks?date=${todayStr}` : null,
    fetcher
  );

  // Load recent notes
  const { data: recentNotes = [] } = useSWR<NoteData[]>(
    user ? '/api/notes' : null,
    fetcher
  );

  // Overall metrics
  const totalPoints = goals.reduce((acc, g) => acc + (g.metrics?.totalPoints || 0), 0);
  const activeStreak = heatmapData?.currentStreak || goals.reduce((max, g) => Math.max(max, g.metrics?.currentStreak || 0), 0);
  const completedGoalsCount = goals.filter((g) => g.isCompleted).length;

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
      mutateHeatmap();
    }
  };

  if (!user && showLanding) {
    return <LandingHero onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-white selection:text-black">
      {/* Notion-style Left Sidebar */}
      <Sidebar
        goals={goals}
        selectedGoalId={null}
        onSelectGoal={(g) => router.push(`/goals-habits?goal=${g.id}`)}
        onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
        totalPoints={totalPoints}
        activeStreak={activeStreak}
      />

      {/* Main Overview Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-1">
                <span>Productivity Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>Welcome back, {user?.name || user?.email?.split('@')[0] || 'Member'}</span>
                <span className="text-xl">⚡</span>
              </h1>
              <p className="text-xs text-white/50 mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')} · Your central productivity overview and completion metrics.
              </p>
            </div>

            <button
              onClick={() => setIsNewGoalModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2]" />
              <span>New Goal</span>
            </button>
          </div>

          {/* SECTION 1: UNIFIED PRODUCTIVITY HEATMAP */}
          {heatmapData ? (
            <ProductivityHeatmap data={heatmapData} />
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-xs text-white/40">
              Loading your live productivity heatmap...
            </div>
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
