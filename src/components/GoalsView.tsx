'use client';

import React, { useState } from 'react';
import { GoalData } from '@/lib/types';
import { Heatmap } from './Heatmap';
import {
  Target,
  Plus,
  Flame,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GoalsViewProps {
  goals: GoalData[];
  onSelectGoal: (goal: GoalData) => void;
  onOpenNewGoal: () => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onSelectGoal,
  onOpenNewGoal,
  onDeleteGoal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const categories = Array.from(new Set(goals.map((g) => g.category)));
  const filteredGoals =
    selectedCategory === 'all'
      ? goals
      : goals.filter((g) => g.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header (Notion Style) */}
      <div className="pb-4 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
          <span>Ziffy</span>
          <span>/</span>
          <span className="text-white">Goals & Habits</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] border border-[#2E2E2E] text-[#00C2CB]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Goals & Habits
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                Track consistency per goal over time rather than daily pass/fail.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNewGoal}
            className="flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-3.5 py-2 text-xs font-bold text-[#1B1B1B] shadow-sm hover:bg-white hover:text-[#1B1B1B] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Database Toolbar (Filter by Category & View switch) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-white/40 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
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
              className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#00C2CB] text-[#1B1B1B] font-bold'
                  : 'bg-[#232323] text-white/70 hover:bg-[#2E2E2E] hover:text-white border border-[#2E2E2E]'
              }`}
            >
              {cat} ({goals.filter((g) => g.category === cat).length})
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-[#2E2E2E] bg-[#1F1F1F] p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              viewMode === 'cards' ? 'bg-[#2E2E2E] text-white font-semibold' : 'text-white/60'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded text-xs font-medium ${
              viewMode === 'table' ? 'bg-[#2E2E2E] text-white font-semibold' : 'text-white/60'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredGoals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2E2E2E] bg-[#1F1F1F]/40 p-12 text-center">
          <Target className="mx-auto h-10 w-10 text-white/20 mb-3" />
          <h3 className="text-sm font-semibold text-white">
            No goals found
          </h3>
          <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
            Create your first goal with custom category, timeframe, and recurring habits.
          </p>
          <button
            onClick={onOpenNewGoal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-3.5 py-2 text-xs font-bold text-[#1B1B1B]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Goal</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const metrics = goal.metrics;
            const recentDays = metrics?.daysSummary ? metrics.daysSummary.slice(-35) : [];

            return (
              <div
                key={goal.id}
                onClick={() => onSelectGoal(goal)}
                className="group relative flex flex-col justify-between rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 shadow-sm hover:border-[#00C2CB]/60 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center rounded-md bg-[#161616] px-2 py-0.5 text-xs font-medium text-[#00C2CB] border border-[#2E2E2E]">
                      {goal.category}
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                      {metrics && (
                        <>
                          <div className="flex items-center gap-1 text-[#FF4FA3] font-semibold">
                            <Flame className="h-3 w-3 fill-[#FF4FA3]" />
                            <span>{metrics.currentStreak}d</span>
                          </div>
                          <span className="text-[#2E2E2E]">·</span>
                          <span className="text-white/60 font-medium">
                            {metrics.totalPoints} pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[#00C2CB] transition-colors">
                      {goal.name}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white transition-colors shrink-0 mt-1" />
                  </div>

                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-white/40 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#00C2CB]" />
                      <span>
                        {format(parseISO(goal.startDate), 'MMM d')}
                        {goal.endDate ? ` → ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ' (ongoing)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{goal.plans?.length || 0} plans</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[#FF4FA3]" />
                      <span>{goal.tasks?.length || 0} tasks/habits</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2E2E2E]">
                  <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                    <span>Recent 5 weeks</span>
                    <span className="text-[#00C2CB]">Open details →</span>
                  </div>
                  <Heatmap daysSummary={recentDays} compact />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Notion Database Table View */
        <div className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2E2E2E] bg-[#161616] text-white/40 font-semibold">
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Timeframe</th>
                <th className="p-3">Plans / Tasks</th>
                <th className="p-3">Streak & Points</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {filteredGoals.map((goal) => (
                <tr
                  key={goal.id}
                  onClick={() => onSelectGoal(goal)}
                  className="hover:bg-[#232323] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-semibold text-white">
                    {goal.name}
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#161616] text-[#00C2CB] border border-[#2E2E2E]">
                      {goal.category}
                    </span>
                  </td>
                  <td className="p-3 text-white/60">
                    {format(parseISO(goal.startDate), 'MMM d, yyyy')}
                    {goal.endDate ? ` → ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ''}
                  </td>
                  <td className="p-3 text-white/60">
                    {goal.plans?.length || 0} plans · {goal.tasks?.length || 0} tasks
                  </td>
                  <td className="p-3">
                    <span className="text-[#FF4FA3] font-semibold">{goal.metrics?.currentStreak || 0}d</span>
                    <span className="text-white/40 mx-1">·</span>
                    <span className="text-white/80">{goal.metrics?.totalPoints || 0} pts</span>
                  </td>
                  <td className="p-3 text-right">
                    <ChevronRight className="h-4 w-4 inline text-white/40" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
