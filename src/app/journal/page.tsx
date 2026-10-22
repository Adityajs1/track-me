'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { NoteData, GoalData } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { CreateGoalModal } from '@/components/Modal';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Lock,
  Search,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JournalPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  // Load Notes
  const { data: notes = [], mutate: mutateNotes, isLoading: notesLoading } = useSWR<NoteData[]>(
    user ? '/api/notes' : null,
    fetcher
  );

  // Load Goals for category tags
  const { data: goals = [], mutate: mutateGoals } = useSWR<GoalData[]>(
    user ? '/api/goals' : null,
    fetcher
  );

  // Overall metrics for sidebar
  const totalPoints = goals.reduce((acc, g) => acc + (g.metrics?.totalPoints || 0), 0);
  const activeStreak = goals.reduce((max, g) => Math.max(max, g.metrics?.currentStreak || 0), 0);

  const handleStartCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setSelectedGoalId('');
    setError(null);
    setIsCreating(true);
  };

  const handleStartEdit = (note: NoteData) => {
    setEditingNoteId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
    setSelectedGoalId(note.goalId || '');
    setError(null);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingNoteId ? `/api/notes/${editingNoteId}` : '/api/notes';
      const method = editingNoteId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          goalId: selectedGoalId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save entry.');
      }

      await mutateNotes();
      setIsCreating(false);
      setEditingNoteId(null);
      setTitle('');
      setContent('');
      setSelectedGoalId('');
    } catch (err: any) {
      setError(err?.message || 'Failed to save entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await mutateNotes();
      if (editingNoteId === id) {
        setIsCreating(false);
      }
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = n.title?.toLowerCase().includes(q);
    const matchContent = n.content.toLowerCase().includes(q);
    const matchGoal = n.goal?.name.toLowerCase().includes(q);
    return matchTitle || matchContent || matchGoal;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans selection:bg-[#FF4FA3] selection:text-white">
      {/* Sidebar with active tab */}
      <Sidebar
        activeTab="notes"
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
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <BookOpen className="h-7 w-7 text-[#FF4FA3]" />
                <span>Journal & Reflections</span>
              </h1>
              <p className="text-xs text-white/50 mt-1">
                Private, distraction-free space for notes, lessons, and thoughts.
              </p>
            </div>

            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2]" />
              <span>New Entry</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries by title, notes, or goal tag..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
          </div>

          {/* New / Edit Entry Form */}
          {isCreating && (
            <form
              onSubmit={handleSubmit}
              className="glass-panel rounded-2xl p-6 space-y-4 border border-[#FF4FA3]/30 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#FF4FA3] font-bold">
                  {editingNoteId ? 'Edit Journal Entry' : 'Create New Journal Entry'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1 rounded text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Entry Title (Optional)"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-white focus:border-white/40 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161616] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="">-- General Reflection --</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>Goal: {g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reflection, lessons learned, or stream of thought..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-white/20 focus:border-white/40 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-white hover:bg-white/90 text-black px-5 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingNoteId ? 'Save Changes' : 'Publish Entry'}
                </button>
              </div>
            </form>
          )}

          {/* Notes List */}
          {filteredNotes.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center space-y-3">
              <BookOpen className="h-8 w-8 text-white/20 mx-auto" />
              <p className="text-xs text-white/40">
                {notes.length === 0
                  ? 'Your journal is completely clean. Click "New Entry" to record your first thought.'
                  : 'No entries match your search query.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="glass-panel rounded-2xl p-5 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {note.goal?.name ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/60">
                            {note.goal.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-white/40">
                            General
                          </span>
                        )}
                        <span className="text-[10px] text-white/40 font-mono">
                          {format(new Date(note.createdAt), 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>

                      {note.title && (
                        <h3 className="text-base font-bold text-white mt-1">
                          {note.title}
                        </h3>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed font-sans">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
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
