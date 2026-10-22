'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { TaskData, GoalData, DailyCheckInData } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { CreateGoalModal } from '@/components/Modal';
import {
  CheckCircle2,
  Calendar,
  Sparkles,
  Smile,
  Zap,
  AlignLeft,
  Check,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DailyCheckInPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [energy, setEnergy] = useState<number>(4);
  const [mood, setMood] = useState<string>('Focused');
  const [reflection, setReflection] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  // Load check-in for selected date
  const { data: currentCheckIn, mutate: mutateCheckIn } = useSWR<DailyCheckInData | null>(
    user ? `/api/checkins?date=${selectedDate}` : null,
    fetcher
  );

  // Load past check-ins
  const { data: pastCheckIns = [], mutate: mutatePastCheckIns } = useSWR<DailyCheckInData[]>(
    user ? '/api/checkins' : null,
    fetcher
  );

  // Load goals & daily tasks for this date
  const { data: goals = [], mutate: mutateGoals } = useSWR<GoalData[]>(
    user ? '/api/goals' : null,
    fetcher
  );

  const { data: dailyTasks = [], mutate: mutateTasks } = useSWR<TaskData[]>(
    user ? `/api/tasks?date=${selectedDate}` : null,
    fetcher
  );

  // Sync form with current check-in data
  useEffect(() => {
    if (currentCheckIn) {
      setEnergy(currentCheckIn.energy || 4);
      setMood(currentCheckIn.mood || 'Focused');
      setReflection(currentCheckIn.reflection || '');
    } else {
      setEnergy(4);
      setMood('Focused');
      setReflection('');
    }
    setSaveSuccess(false);
    setError(null);
  }, [currentCheckIn, selectedDate]);

  // Overall metrics
  const totalPoints = goals.reduce((acc, g) => acc + (g.metrics?.totalPoints || 0), 0);
  const activeStreak = goals.reduce((max, g) => Math.max(max, g.metrics?.currentStreak || 0), 0);

  // Tasks completed for this day
  const totalTasks = dailyTasks.length;
  const completedTasks = dailyTasks.filter((t) => (t as any).isDoneToday || t.done).length;

  const handleToggleTask = async (taskId: string, isDone: boolean) => {
    const res = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, done: !isDone }),
    });
    if (res.ok) {
      await mutateTasks();
      await mutateGoals();
    }
  };

  const handleSaveCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          energy,
          mood,
          reflection,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save check-in.');
      }

      await mutateCheckIn();
      await mutatePastCheckIns();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save check-in.');
    } finally {
      setIsSaving(false);
    }
  };

  const moodOptions = ['Great', 'Focused', 'Steady', 'Tired', 'Challenging'];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-[#FF4FA3] selection:text-white">
      {/* Sidebar with active tab */}
      <Sidebar
        activeTab="checkin"
        setActiveTab={() => {}}
        goals={goals}
        selectedGoalId={null}
        onSelectGoal={(g) => router.push(`/goals-habits?goal=${g.id}`)}
        onOpenNewGoal={() => setIsNewGoalModalOpen(true)}
        onOpenLanding={() => router.push('/')}
        totalPoints={totalPoints}
        activeStreak={activeStreak}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-4xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-[#00C2CB]" />
                <span>Daily Check-In</span>
              </h1>
              <p className="text-xs text-white/50 mt-1">
                Reflect on your daily progress, energy levels, and completed habits.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Daily check-in saved and recorded to your productivity heatmap!</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Check-in Form Card */}
          <form onSubmit={handleSaveCheckIn} className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6">
            {/* Energy & Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Energy Level ({energy}/5)</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergy(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        energy === lvl
                          ? 'bg-amber-400 text-black shadow-sm'
                          : 'bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2 flex items-center gap-1.5">
                  <Smile className="h-3.5 w-3.5 text-[#00C2CB]" />
                  <span>Mindset / Mood</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {moodOptions.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        mood === m
                          ? 'bg-[#00C2CB] text-black font-semibold'
                          : 'bg-white/[0.04] border border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Habits Checklist Review */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-[#FF4FA3]" />
                  <span>Daily Habits & Tasks ({completedTasks}/{totalTasks})</span>
                </span>
                <span className="text-white/40 font-mono">
                  {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% done` : 'No items scheduled'}
                </span>
              </div>

              {dailyTasks.length === 0 ? (
                <p className="text-xs text-white/40 italic">
                  No habits or scheduled tasks for this date. Create habits in Goals & Habits to track them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {dailyTasks.map((t) => {
                    const isDone = Boolean((t as any).isDoneToday || t.done);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(t.id, isDone)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-white/[0.02] border-white/10 text-white/80 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center ${
                              isDone ? 'bg-emerald-500 text-black' : 'border border-white/30'
                            }`}
                          >
                            {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-medium ${isDone ? 'line-through opacity-70' : ''}`}>
                            {t.title}
                          </span>
                        </div>
                        {t.goal?.name && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/50 font-mono">
                            {t.goal.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reflection / Journal Notes */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2 flex items-center gap-1.5">
                <AlignLeft className="h-3.5 w-3.5 text-white/60" />
                <span>Daily Reflection & Wins</span>
              </label>
              <textarea
                rows={3}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What went well today? Any key lessons or focus areas for tomorrow?"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-white/40 focus:outline-none resize-none transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-white hover:bg-white/90 text-black px-6 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Check-in...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Daily Check-in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Past Check-ins History */}
          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-white/50">
              Recent Check-in History
            </h2>

            {pastCheckIns.length === 0 ? (
              <p className="text-xs text-white/40 italic">
                No past check-ins recorded yet. Completing check-ins directly updates your productivity heatmap.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pastCheckIns.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedDate(format(new Date(c.date), 'yyyy-MM-dd'))}
                    className="glass-panel rounded-xl p-4 space-y-2 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {format(new Date(c.date), 'EEEE, MMM d')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {c.mood || 'Completed'}
                      </span>
                    </div>
                    {c.reflection && (
                      <p className="text-xs text-white/60 line-clamp-2">
                        {c.reflection}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        onCreateGoal={async (goalInput) => {
          await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalInput),
          });
          mutateGoals();
        }}
      />
    </div>
  );
}
