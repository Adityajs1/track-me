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
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Page Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/40 mb-2 font-mono">
          <span>ziffy</span>
          <span>/</span>
          <span className="text-white">Goals & Habits</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Goals & Habits
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Organise structured phases, daily habits, and effort trends.
            </p>
          </div>

          <button
            onClick={onOpenNewGoal}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2]" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Database Toolbar (Filter by Category & View switch) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-white/40 flex items-center gap-1 mr-1 text-[11px] font-mono uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 stroke-[1.5]" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-3 py-1 font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            All ({goals.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat} ({goals.filter((g) => g.category === cat).length})
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-white text-black font-semibold shadow-xs' : 'text-white/50'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-white text-black font-semibold shadow-xs' : 'text-white/50'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredGoals.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <Target className="mx-auto h-12 w-12 text-white/20 mb-4 stroke-[1.25]" />
          <h3 className="text-base font-semibold text-white">
            No goals created yet
          </h3>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto leading-relaxed">
            Start completely clean. Create your first goal to track habits, time-boxed phases, and dynamic consistency trends.
          </p>
          <button
            onClick={onOpenNewGoal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-white/90 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2]" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
            const metrics = goal.metrics;
            const recentDays = metrics?.daysSummary ? metrics.daysSummary.slice(-35) : [];

            return (
              <div
                key={goal.id}
                onClick={() => onSelectGoal(goal)}
                className="glass-panel glass-panel-hover group relative flex flex-col justify-between rounded-2xl p-6 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] font-mono text-white/80 border border-white/10">
                      {goal.category}
                    </span>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      {metrics && (
                        <>
                          <div className="flex items-center gap-1 text-white/90">
                            <Flame className="h-3.5 w-3.5 stroke-[1.5]" />
                            <span>{metrics.currentStreak}d</span>
                          </div>
                          <span className="text-white/20">·</span>
                          <span className="text-white/50">
                            {metrics.totalPoints} pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors">
                      {goal.name}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1 stroke-[1.5]" />
                  </div>

                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-white/40 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
                      <span>
                        {format(parseISO(goal.startDate), 'MMM d')}
                        {goal.endDate ? ` → ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ' (ongoing)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 stroke-[1.5]" />
                      <span>{goal.plans?.length || 0} plans</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      <span>{goal.tasks?.length || 0} habits/tasks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] text-white/40 mb-1.5">
                    <span>Recent 5 weeks</span>
                    <span className="text-white/60 group-hover:text-white transition-colors">View details →</span>
                  </div>
                  <Heatmap daysSummary={recentDays} compact />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Database Table View */
        <div className="glass-panel rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Timeframe</th>
                <th className="p-4">Plans / Tasks</th>
                <th className="p-4">Streak & Points</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGoals.map((goal) => (
                <tr
                  key={goal.id}
                  onClick={() => onSelectGoal(goal)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <td className="p-4 font-semibold text-white">
                    {goal.name}
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-white/[0.05] text-white/80 border border-white/10 font-mono">
                      {goal.category}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 font-mono">
                    {format(parseISO(goal.startDate), 'MMM d, yyyy')}
                    {goal.endDate ? ` → ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ''}
                  </td>
                  <td className="p-4 text-white/50">
                    {goal.plans?.length || 0} plans · {goal.tasks?.length || 0} tasks
                  </td>
                  <td className="p-4 font-mono">
                    <span className="text-white font-semibold">{goal.metrics?.currentStreak || 0}d</span>
                    <span className="text-white/20 mx-1">·</span>
                    <span className="text-white/60">{goal.metrics?.totalPoints || 0} pts</span>
                  </td>
                  <td className="p-4 text-right">
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
