'use client';

import React, { useState } from 'react';
import { GoalData, PlanData, TaskData, NoteData } from '@/lib/types';
import { Heatmap } from './Heatmap';
import {
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  Sparkles,
  Repeat,
  FileText,
  Clock,
  Square,
  CheckSquare,
  Tag,
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
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <button onClick={onBack} className="hover:text-white transition-colors cursor-pointer">
            Goals
          </button>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-xs">{goal.name}</span>
        </div>

        <button
          onClick={() => {
            if (confirm(`Delete goal "${goal.name}"? This action cannot be undone.`)) {
              onDeleteGoal(goal.id);
            }
          }}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Goal</span>
        </button>
      </div>

      {/* Goal Notion Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#232323] text-[#00C2CB] text-xs font-semibold border border-[#2E2E2E]">
                {goal.category}
              </span>
              <span className="text-xs text-white/40">
                Started {format(parseISO(goal.startDate), 'MMM d, yyyy')}
                {goal.endDate ? ` · Target ${format(parseISO(goal.endDate), 'MMM d, yyyy')}` : ''}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {goal.name}
            </h1>
          </div>

          {/* Metrics Pill */}
          <div className="flex items-center gap-2 bg-[#1F1F1F] p-3 rounded-xl border border-[#2E2E2E]">
            <div className="flex items-center gap-1.5 text-[#FF4FA3] font-semibold text-xs">
              <Flame className="h-4 w-4 fill-[#FF4FA3]" />
              <span>{metrics?.currentStreak || 0}d streak</span>
            </div>
            <span className="text-[#2E2E2E]">|</span>
            <div className="text-xs text-white/70">
              <span className="font-bold text-[#00C2CB]">{metrics?.totalPoints || 0}</span> pts
            </div>
          </div>
        </div>

        {/* 180-day Heatmap Consistency Grid */}
        <div className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-2">
          <div className="text-xs font-semibold text-white/70">
            Consistency Trend (Last 180 Days)
          </div>
          <Heatmap daysSummary={daysSummary} />
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-[#2E2E2E] gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#00C2CB] text-[#00C2CB] font-bold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Overview & Structure
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'plans'
              ? 'border-[#00C2CB] text-[#00C2CB] font-bold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Phase Plans ({goal.plans?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-[#00C2CB] text-[#00C2CB] font-bold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Habits & Tasks ({goal.tasks?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'notes'
              ? 'border-[#00C2CB] text-[#00C2CB] font-bold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Journal Entries ({goal.notes?.length || 0})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Habits */}
          <div className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Repeat className="h-4 w-4 text-[#00C2CB]" />
                <span>Daily Recurring Habits</span>
              </div>
              <button
                onClick={() => {
                  setTaskIsRecurring(true);
                  setIsAddingTask(true);
                  setActiveTab('tasks');
                }}
                className="text-xs text-[#00C2CB] hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="h-3 w-3" />
                Add Habit
              </button>
            </div>

            {recurringTasks.length === 0 ? (
              <p className="text-xs text-white/40 py-2">No daily habits configured yet.</p>
            ) : (
              <div className="space-y-1.5">
                {recurringTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#161616] text-xs border border-[#2E2E2E]"
                  >
                    <span className="font-medium text-white">{t.title}</span>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-white/30 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phase Plans */}
          <div className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Layers className="h-4 w-4 text-[#FF4FA3]" />
                <span>Structured Phase Plans</span>
              </div>
              <button
                onClick={() => {
                  setIsAddingPlan(true);
                  setActiveTab('plans');
                }}
                className="text-xs text-[#FF4FA3] hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="h-3 w-3" />
                Add Phase
              </button>
            </div>

            {!goal.plans || goal.plans.length === 0 ? (
              <p className="text-xs text-white/40 py-2">
                No phase plans added. (Optional: useful when a goal needs time-boxed sub-stages).
              </p>
            ) : (
              <div className="space-y-1.5">
                {goal.plans.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#161616] text-xs border border-[#2E2E2E]"
                  >
                    <div>
                      <span className="font-medium text-white">{p.name}</span>
                      <div className="text-[10px] text-white/40">
                        {format(parseISO(p.startDate), 'MMM d')} → {format(parseISO(p.endDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeletePlan(p.id)}
                      className="text-white/30 hover:text-rose-400"
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

      {/* Tab: Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Phase Plans</h3>
            <button
              onClick={() => setIsAddingPlan(!isAddingPlan)}
              className="flex items-center gap-1 rounded-lg bg-[#FF4FA3] px-3 py-1.5 text-xs font-bold text-[#1B1B1B]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingPlan ? 'Cancel' : 'New Phase'}</span>
            </button>
          </div>

          {isAddingPlan && (
            <form
              onSubmit={handleCreatePlan}
              className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Phase Name
                </label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Phase 1: Base Building"
                  className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white focus:border-[#00C2CB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={planStart}
                    onChange={(e) => setPlanStart(e.target.value)}
                    className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={planEnd}
                    onChange={(e) => setPlanEnd(e.target.value)}
                    className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPlan(false)}
                  className="px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FF4FA3] px-3.5 py-1.5 text-xs font-bold text-[#1B1B1B]"
                >
                  Save Phase
                </button>
              </div>
            </form>
          )}

          {goal.plans?.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                <p className="text-xs text-white/40 mt-0.5">
                  {format(parseISO(plan.startDate), 'MMM d, yyyy')} →{' '}
                  {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <button
                onClick={() => onDeletePlan(plan.id)}
                className="text-white/30 hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Tasks & Habits</h3>
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1 rounded-lg bg-[#FF4FA3] px-3 py-1.5 text-xs font-bold text-[#1B1B1B]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingTask ? 'Cancel' : 'New Task / Habit'}</span>
            </button>
          </div>

          {isAddingTask && (
            <form
              onSubmit={handleCreateTask}
              className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages or Complete Chapter 1"
                  className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white focus:border-[#00C2CB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Type
                  </label>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={taskIsRecurring}
                        onChange={() => setTaskIsRecurring(true)}
                        className="accent-[#00C2CB]"
                      />
                      <span>Daily Habit</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={!taskIsRecurring}
                        onChange={() => setTaskIsRecurring(false)}
                        className="accent-[#FF4FA3]"
                      />
                      <span>One-Off Task</span>
                    </label>
                  </div>
                </div>

                {!taskIsRecurring && (
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={taskTargetDate}
                      onChange={(e) => setTaskTargetDate(e.target.value)}
                      className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {goal.plans && goal.plans.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Phase Plan (Optional)
                  </label>
                  <select
                    value={taskPlanId}
                    onChange={(e) => setTaskPlanId(e.target.value)}
                    className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
                  >
                    <option value="">Directly under Goal</option>
                    {goal.plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FF4FA3] px-3.5 py-1.5 text-xs font-bold text-[#1B1B1B]"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1.5">
            {goal.tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#2E2E2E] bg-[#1F1F1F]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-white">{task.title}</span>
                  {task.isRecurring ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#161616] text-[#00C2CB] px-2 py-0.5 rounded border border-[#2E2E2E]">
                      <Repeat className="h-3 w-3" />
                      Daily habit
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/40">
                      Target: {task.targetDate ? format(parseISO(task.targetDate), 'MMM d, yyyy') : 'Any'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-white/30 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Journal Notes for {goal.name}</h3>
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center gap-1 rounded-lg bg-[#FF4FA3] px-3 py-1.5 text-xs font-bold text-[#1B1B1B]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingNote ? 'Cancel' : 'New Note'}</span>
            </button>
          </div>

          {isAddingNote && (
            <form
              onSubmit={handleCreateNote}
              className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Reflection title..."
                  className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Reflect on progress, obstacles, adjustments..."
                  className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FF4FA3] px-3.5 py-1.5 text-xs font-bold text-[#1B1B1B]"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {goal.notes?.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{format(parseISO(note.createdAt), 'MMM d, yyyy · h:mm a')}</span>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-white/30 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {note.title && <h4 className="text-sm font-bold text-white">{note.title}</h4>}
                <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
