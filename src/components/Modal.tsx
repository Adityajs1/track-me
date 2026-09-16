'use client';

import React, { useState } from 'react';
import { X, Target, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#2E2E2E] bg-[#1B1B1B] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#2E2E2E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#232323] border border-[#2E2E2E] text-[#00C2CB]">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Run a 10K Marathon or Master System Design"
              className="w-full rounded-xl border border-[#2E2E2E] bg-[#232323] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#FF4FA3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Category (user-defined)
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Fitness, Learning, Career, Mindset..."
              className="w-full rounded-xl border border-[#2E2E2E] bg-[#232323] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#00C2CB] focus:outline-none"
            />
            <p className="text-[11px] text-white/40 mt-1">
              No hardcoded lists — you define the areas of your life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[#2E2E2E] bg-[#232323] px-3 py-2 text-sm text-white focus:border-[#00C2CB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Target End Date (Optional)
              </label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  disabled={!hasEndDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm text-white focus:outline-none ${
                    hasEndDate
                      ? 'border-[#2E2E2E] bg-[#232323] focus:border-[#FF4FA3]'
                      : 'border-[#2E2E2E]/50 bg-[#1B1B1B] text-white/20 cursor-not-allowed'
                  }`}
                />
                <label className="flex items-center gap-1.5 text-[11px] text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="accent-[#FF4FA3]"
                  />
                  <span>Has target end date</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#2E2E2E]">
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
              className="rounded-xl bg-[#FF4FA3] px-5 py-2.5 text-xs font-bold text-[#1B1B1B] shadow-md hover:bg-white transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
