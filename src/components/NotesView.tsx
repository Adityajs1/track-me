'use client';

import React, { useState } from 'react';
import { NoteData, GoalData } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { BookOpen, Plus, Trash2, Tag, Calendar } from 'lucide-react';

interface NotesViewProps {
  notes: NoteData[];
  goals: GoalData[];
  onCreateNote: (note: { goalId: string | null; title: string; content: string }) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  goals,
  onCreateNote,
  onDeleteNote,
}) => {
  const [filter, setFilter] = useState<'all' | 'general' | string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  const filteredNotes = notes.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'general') return !n.goalId;
    return n.goalId === filter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onCreateNote({
      goalId: selectedGoalId || null,
      title: title.trim() || '',
      content: content.trim(),
    });

    setTitle('');
    setContent('');
    setSelectedGoalId('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50 shadow-xs">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Reflection & Observations
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
            Journal & Notes
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Capture daily reflections, breakthroughs, and adjustments scoped to goals or general thoughts.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          All Notes ({notes.length})
        </button>

        <button
          onClick={() => setFilter('general')}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            filter === 'general'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          General Journal ({notes.filter((n) => !n.goalId).length})
        </button>

        {goals.map((g) => {
          const count = notes.filter((n) => n.goalId === g.id).length;
          return (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                filter === g.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {g.name} ({count})
            </button>
          );
        })}
      </div>

      {/* New Note Form */}
      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Create Journal Entry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Context / Goal Scope
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="">General Journal (No specific goal)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    Goal: {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly cadence breakthrough"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Reflection / Notes
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write what went well, obstacles encountered, and what to adjust next..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Notes Feed */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No journal entries found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Start jotting down thoughts, reflections, and insights.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {note.goal ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <Tag className="h-3 w-3" />
                      {note.goal.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                      <BookOpen className="h-3 w-3" />
                      General Journal
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    {format(parseISO(note.createdAt), 'MMM d, yyyy · h:mm a')}
                  </span>
                </div>

                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {note.title && (
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {note.title}
                </h3>
              )}

              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
