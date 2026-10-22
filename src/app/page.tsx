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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-[#FF4FA3] selection:text-white">
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

          {/* SECTION 2: MODULAR FEATURE HUBS (Clean, uncluttered cards linking to dedicated pages) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-wider text-white/50">
                Dedicated Feature Hubs
              </h2>
              <span className="text-[11px] text-white/40">
                Click any hub to open its dedicated workspace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HUB 1: GOALS & HABITS */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#00C2CB]">
                      <Target className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Goals & Habits</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/60">
                      {goals.length} Goals
                    </span>
                  </div>

                  <p className="text-xs text-white/60">
                    Establish milestone goals with green completion tracking and recurring daily habits.
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs font-mono">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <strong>{completedGoalsCount}</strong> Completed
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/80">
                      <strong>{goals.length - completedGoalsCount}</strong> Active
                    </span>
                  </div>
                </div>

                <Link
                  href="/goals-habits"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#00C2CB] transition-colors pt-2 border-t border-white/10"
                >
                  <span>Open Goals & Habits Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* HUB 2: DAILY CHECK-IN */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#FF4FA3]">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Daily Check-In</span>
                    </div>
                    {todayCheckIn ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Completed Today ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300">
                        Pending Today
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/60">
                    Record your energy levels, mindset, wins, and reflections for continuous momentum.
                  </p>

                  <div className="pt-2 text-xs text-white/50">
                    {todayCheckIn?.reflection ? (
                      <span className="italic line-clamp-1">&ldquo;{todayCheckIn.reflection}&rdquo;</span>
                    ) : (
                      <span>Take 60 seconds to complete today&apos;s reflection.</span>
                    )}
                  </div>
                </div>

                <Link
                  href="/daily-check-in"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#FF4FA3] transition-colors pt-2 border-t border-white/10"
                >
                  <span>{todayCheckIn ? 'Review Daily Check-In' : 'Complete Daily Check-In'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* HUB 3: TIME BLOCKING */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#3B82F6]">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Time-Blocking</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/60">
                      {todayBlocks.length} Scheduled Today
                    </span>
                  </div>

                  <p className="text-xs text-white/60">
                    Day, Week, and Month calendar timeline inspired by Google Calendar for hourly allocation.
                  </p>

                  <div className="pt-2 text-xs text-white/50">
                    {todayBlocks.length > 0 ? (
                      <span>Next block: <strong className="text-white">{todayBlocks[0].title}</strong> ({todayBlocks[0].startTime})</span>
                    ) : (
                      <span>No time blocks scheduled for today yet.</span>
                    )}
                  </div>
                </div>

                <Link
                  href="/time-blocking"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#3B82F6] transition-colors pt-2 border-t border-white/10"
                >
                  <span>Open Calendar Timeline</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* HUB 4: JOURNAL & NOTES */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Journal & Notes</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/60">
                      {recentNotes.length} Entries
                    </span>
                  </div>

                  <p className="text-xs text-white/60">
                    Private, distraction-free writing environment for structured notes and thoughts.
                  </p>

                  <div className="pt-2 text-xs text-white/50">
                    {recentNotes.length > 0 ? (
                      <span className="truncate block">Latest: <strong className="text-white">{recentNotes[0].title || 'Untitled note'}</strong></span>
                    ) : (
                      <span>Your private journal is ready for your first note.</span>
                    )}
                  </div>
                </div>

                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-purple-400 transition-colors pt-2 border-t border-white/10"
                >
                  <span>Open Journal Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
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
