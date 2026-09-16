'use client';

import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { format } from 'date-fns';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: {
    name: string;
    category: string;
    startDate: string;
    endDate?: string;
  }) => Promise<void>;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onCreateGoal,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateGoal({
        name: name.trim(),
        category: category.trim(),
        startDate,
        endDate: hasEndDate && endDate ? endDate : undefined,
      });
      setName('');
      setCategory('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E0E0E] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white">
              <Target className="h-4 w-4 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Create New Goal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marathon Training or Learn Rust"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-white/40 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
              Category (user-defined)
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Health, Career, Craft, Learning..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-white/40 focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-white/40 mt-1 font-mono">
              Zero hardcoded categories — define what matters to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-white/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                End Date (Optional)
              </label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  disabled={!hasEndDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs text-white focus:outline-none ${
                    hasEndDate
                      ? 'border-white/10 bg-white/[0.03] focus:border-white/40'
                      : 'border-white/5 bg-transparent text-white/10 cursor-not-allowed'
                  }`}
                />
                <label className="flex items-center gap-1.5 text-[11px] text-white/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="accent-white"
                  />
                  <span>Time-boxed goal</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-sm hover:bg-white/90 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
