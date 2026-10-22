'use client';

import React, { useState, useEffect } from 'react';
import { TimeBlockData, TaskData } from '@/lib/types';
import { CALENDAR_COLORS, timeToMinutes, minutesToTime, formatTime12 } from '@/lib/calendarUtils';
import { X, Clock, Calendar as CalendarIcon, Tag, AlignLeft, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlock?: Partial<TimeBlockData> | null;
  tasks: TaskData[];
  onSave: (blockData: {
    id?: string;
    title: string;
    description?: string;
    color: string;
    date: string;
    startTime: string;
    endTime: string;
    taskId?: string;
    taskInstanceId?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  isOpen,
  onClose,
  initialBlock,
  tasks,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(initialBlock?.id);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(CALENDAR_COLORS[0].hex);
  const [description, setDescription] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setShowDeleteConfirm(false);

      if (initialBlock) {
        setTitle(initialBlock.title || '');
        if (initialBlock.date) {
          try {
            setDate(format(new Date(initialBlock.date), 'yyyy-MM-dd'));
          } catch {
            setDate(format(new Date(), 'yyyy-MM-dd'));
          }
        }
        setStartTime(initialBlock.startTime || '09:00');
        setEndTime(initialBlock.endTime || '10:00');
        setColor(initialBlock.color || CALENDAR_COLORS[0].hex);
        setDescription(initialBlock.description || '');
        setSelectedTaskId(initialBlock.taskId || '');
      } else {
        setTitle('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setStartTime('09:00');
        setEndTime('10:00');
        setColor(CALENDAR_COLORS[0].hex);
        setDescription('');
        setSelectedTaskId('');
      }
    }
  }, [isOpen, initialBlock]);

  if (!isOpen) return null;

  // Calculate duration label
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const diffMin = endMin - startMin;
  const durationText =
    diffMin > 0
      ? diffMin >= 60
        ? `${Math.floor(diffMin / 60)}h ${diffMin % 60 > 0 ? `${diffMin % 60}m` : ''}`
        : `${diffMin} mins`
      : 'Invalid time';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide an activity or task title.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    setIsSaving(true);
    try {
      const task = tasks.find((t) => t.id === selectedTaskId);

      await onSave({
        id: initialBlock?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        color,
        date,
        startTime,
        endTime,
        taskId: selectedTaskId || undefined,
        taskInstanceId: task?.isRecurring ? ((task as any).instanceId || undefined) : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save time block. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialBlock?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(initialBlock.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete time block.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full ring-2 ring-white/20 transition-colors"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-base font-semibold text-white">
              {isEditing ? 'Edit Time Block' : 'Schedule Time Block'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
              Activity Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Work on Core Engine, Morning Run..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-white/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-white/50">
            <span>Duration: <strong className="text-white">{durationText}</strong></span>
            <span>{formatTime12(startTime)} → {formatTime12(endTime)}</span>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
              Color Code
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CALENDAR_COLORS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-white scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && (
                      <Check className={`h-4 w-4 stroke-[3] ${c.isDarkText ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Task Link */}
          {tasks.length > 0 && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Link to Goal Task (Optional)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  const selected = tasks.find((t) => t.id === e.target.value);
                  if (selected && !title) {
                    setTitle(selected.title);
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option value="">-- Standalone Time Block --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.goal?.name ? `[${t.goal.name}] ` : ''}{t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key deliverables, agenda, or focus notes..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:border-white/40 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {isEditing && onDelete ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 text-xs text-white/50 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-rose-400 transition-colors p-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-5 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Save Changes' : 'Create Block'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
