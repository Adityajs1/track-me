'use client';

import React, { useState } from 'react';
import { NoteData, GoalData } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { BookOpen, Plus, Trash2, Tag, Calendar, Filter } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl mx-auto text-white">
      {/* Notion Page Header */}
      <div className="pb-4 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
          <span>Ziffy</span>
          <span>/</span>
          <span className="text-white">Journal & Reflections</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] border border-[#2E2E2E] text-[#FF4FA3]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Journal & Notes
              </h1>
              <p className="text-xs text-white/50 mt-0.5">
                Record thoughts, adjustments, and insights scoped to goals or general life.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 rounded-xl bg-[#FF4FA3] px-3.5 py-2 text-xs font-bold text-[#1B1B1B] shadow-sm hover:bg-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1 font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#00C2CB] text-[#1B1B1B] font-bold'
              : 'bg-[#232323] text-white/70 hover:bg-[#2E2E2E] border border-[#2E2E2E]'
          }`}
        >
          All Notes ({notes.length})
        </button>

        <button
          onClick={() => setFilter('general')}
          className={`rounded-lg px-3 py-1 font-medium transition-colors ${
            filter === 'general'
              ? 'bg-[#00C2CB] text-[#1B1B1B] font-bold'
              : 'bg-[#232323] text-white/70 hover:bg-[#2E2E2E] border border-[#2E2E2E]'
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
              className={`rounded-lg px-3 py-1 font-medium whitespace-nowrap transition-colors ${
                filter === g.id
                  ? 'bg-[#00C2CB] text-[#1B1B1B] font-bold'
                  : 'bg-[#232323] text-white/70 hover:bg-[#2E2E2E] border border-[#2E2E2E]'
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
          className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-3 shadow-md"
        >
          <h3 className="text-sm font-bold text-white">Create Journal Entry</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                Context / Goal Scope
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
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
              <label className="block text-xs font-medium text-white/80 mb-1">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly cadence breakthrough"
                className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              Reflection Content
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What went well? What blockers did you face? What will you adjust?"
              className="w-full rounded-lg border border-[#2E2E2E] bg-[#161616] px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#FF4FA3] px-4 py-1.5 text-xs font-bold text-[#1B1B1B]"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Notes Feed */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2E2E2E] bg-[#1F1F1F]/40 p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-white/20 mb-3" />
            <h3 className="text-sm font-semibold text-white">No journal entries yet</h3>
            <p className="text-xs text-white/50 mt-1">
              Start writing reflections to review consistency trends over time.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-[#2E2E2E] bg-[#1F1F1F] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {note.goal ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#161616] px-2 py-0.5 text-xs font-semibold text-[#00C2CB] border border-[#2E2E2E]">
                      <Tag className="h-3 w-3" />
                      {note.goal.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#161616] px-2 py-0.5 text-xs font-semibold text-[#FF4FA3] border border-[#2E2E2E]">
                      <BookOpen className="h-3 w-3" />
                      General Journal
                    </span>
                  )}
                  <span className="text-xs text-white/40">
                    {format(parseISO(note.createdAt), 'MMM d, yyyy · h:mm a')}
                  </span>
                </div>

                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-white/30 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {note.title && (
                <h3 className="text-sm font-bold text-white">{note.title}</h3>
              )}

              <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
