'use client';

import React, { useState } from 'react';
import { GoalData, PlanData, TaskData, NoteData } from '@/lib/types';
import { Heatmap } from './Heatmap';
import {
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Flame,
  Sparkles,
  Repeat,
  FileText,
  Clock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GoalDetailViewProps {
  goal: GoalData;
  onBack: () => void;
  onUpdateGoal: (id: string, updates: Partial<GoalData>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onAddPlan: (goalId: string, name: string, startDate: string, endDate: string) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onAddTask: (taskData: Partial<TaskData>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onToggleTask: (taskId: string, isDone: boolean) => Promise<void>;
  onAddNote: (goalId: string | null, title: string, content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export const GoalDetailView: React.FC<GoalDetailViewProps> = ({
  goal,
  onBack,
  onDeleteGoal,
  onAddPlan,
  onDeletePlan,
  onAddTask,
  onDeleteTask,
  onToggleTask,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'tasks' | 'notes'>('overview');

  // Form states
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planStart, setPlanStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [planEnd, setPlanEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPlanId, setTaskPlanId] = useState<string>('');
  const [taskIsRecurring, setTaskIsRecurring] = useState(true);
  const [taskTargetDate, setTaskTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const metrics = goal.metrics;
  const daysSummary = metrics?.daysSummary || [];

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    await onAddPlan(goal.id, planName.trim(), planStart, planEnd);
    setPlanName('');
    setIsAddingPlan(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await onAddTask({
      goalId: goal.id,
      planId: taskPlanId || null,
      title: taskTitle.trim(),
      isRecurring: taskIsRecurring,
      targetDate: taskIsRecurring ? null : taskTargetDate,
    });
    setTaskTitle('');
    setIsAddingTask(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    await onAddNote(goal.id, noteTitle.trim(), noteContent.trim());
    setNoteTitle('');
    setNoteContent('');
    setIsAddingNote(false);
  };

  const recurringTasks = goal.tasks?.filter((t) => t.isRecurring) || [];
  const oneOffTasks = goal.tasks?.filter((t) => !t.isRecurring) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar: Navigation & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Goals</span>
        </button>

        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete goal "${goal.name}"?`)) {
              onDeleteGoal(goal.id);
            }
          }}
          className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Goal</span>
        </button>
      </div>

      {/* Goal Main Header */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {goal.category}
              </span>
              <span className="text-xs text-zinc-400">
                Created {format(parseISO(goal.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {goal.name}
            </h1>
          </div>

          {/* Metrics summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/60 dark:border-zinc-700/60">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4 fill-amber-500" />
                <div className="text-left">
                  <div className="text-xs font-semibold leading-none">{metrics?.currentStreak || 0}d</div>
                  <div className="text-[10px] text-zinc-400 leading-none mt-1">Streak</div>
                </div>
              </div>
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />
              <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <div className="text-left">
                  <div className="text-xs font-semibold leading-none">{metrics?.totalPoints || 0}</div>
                  <div className="text-[10px] text-zinc-400 leading-none mt-1">Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Timeframe */}
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {format(parseISO(goal.startDate), 'MMM d, yyyy')}
            {goal.endDate ? ` → ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ' (ongoing)'}
          </span>
        </div>

        {/* Heatmap Section */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Consistency Trend (Last 180 Days)
          </h4>
          <Heatmap daysSummary={daysSummary} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Overview & Structure
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'plans'
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Phase Plans ({goal.plans?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Habits & Tasks ({goal.tasks?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'notes'
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Goal Journal & Notes ({goal.notes?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recurring Habits */}
          <div className="rounded-xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Daily Recurring Habits
                </h3>
              </div>
              <button
                onClick={() => {
                  setTaskIsRecurring(true);
                  setIsAddingTask(true);
                  setActiveTab('tasks');
                }}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Habit
              </button>
            </div>

            {recurringTasks.length === 0 ? (
              <p className="text-xs text-zinc-400">No daily recurring habits yet.</p>
            ) : (
              <div className="space-y-2">
                {recurringTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <span className="font-medium">{t.title}</span>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phase Plans */}
          <div className="rounded-xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Time-boxed Phases
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddingPlan(true);
                  setActiveTab('plans');
                }}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Phase
              </button>
            </div>

            {!goal.plans || goal.plans.length === 0 ? (
              <p className="text-xs text-zinc-400">
                No phase plans added. (Optional: use when a goal is large enough to need time-boxed structure).
              </p>
            ) : (
              <div className="space-y-2">
                {goal.plans.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 text-xs"
                  >
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {format(parseISO(p.startDate), 'MMM d')} → {format(parseISO(p.endDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeletePlan(p.id)}
                      className="text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Phase Plans within Goal
            </h3>
            <button
              onClick={() => setIsAddingPlan(!isAddingPlan)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingPlan ? 'Cancel' : 'New Phase Plan'}</span>
            </button>
          </div>

          {isAddingPlan && (
            <form
              onSubmit={handleCreatePlan}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Phase Name (e.g. Phase 1: Base Building)
                </label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Phase name"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={planStart}
                    onChange={(e) => setPlanStart(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={planEnd}
                    onChange={(e) => setPlanEnd(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingPlan(false)}
                  className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Phase
                </button>
              </div>
            </form>
          )}

          {goal.plans?.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {format(parseISO(plan.startDate), 'MMM d, yyyy')} →{' '}
                    {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => onDeletePlan(plan.id)}
                  className="text-zinc-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Goal Tasks & Habits
            </h3>
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingTask ? 'Cancel' : 'New Task / Habit'}</span>
            </button>
          </div>

          {isAddingTask && (
            <form
              onSubmit={handleCreateTask}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages or Run 5k"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Type
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="taskType"
                        checked={taskIsRecurring}
                        onChange={() => setTaskIsRecurring(true)}
                      />
                      <span>Daily Habit (Recurring)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="taskType"
                        checked={!taskIsRecurring}
                        onChange={() => setTaskIsRecurring(false)}
                      />
                      <span>One-Off Task</span>
                    </label>
                  </div>
                </div>

                {!taskIsRecurring && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={taskTargetDate}
                      onChange={(e) => setTaskTargetDate(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                )}
              </div>

              {goal.plans && goal.plans.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Associate with Phase Plan (Optional)
                  </label>
                  <select
                    value={taskPlanId}
                    onChange={(e) => setTaskPlanId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <option value="">None (Belongs directly to Goal)</option>
                    {goal.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {goal.tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </span>
                    {task.isRecurring ? (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                        <Repeat className="h-3 w-3" />
                        Daily habit
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">
                        Target: {task.targetDate ? format(parseISO(task.targetDate), 'MMM d, yyyy') : 'Any'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-zinc-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Journal Entries for {goal.name}
            </h3>
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingNote ? 'Cancel' : 'New Journal Entry'}</span>
            </button>
          </div>

          {isAddingNote && (
            <form
              onSubmit={handleCreateNote}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Reflection title..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Reflect on your progress, breakthroughs, or adjustments..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          {goal.notes?.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {format(parseISO(note.createdAt), 'MMM d, yyyy · h:mm a')}
                </span>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-zinc-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {note.title && (
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {note.title}
                </h4>
              )}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
