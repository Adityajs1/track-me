'use client';

import React, { useState } from 'react';
import { ZiffyLogo } from './ZiffyLogo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  Menu,
  X,
  Layers,
  Calendar,
  BookOpen,
  TrendingUp,
  Flame,
  Plus,
  LogOut,
  LogIn,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenNewGoal?: () => void;
  totalPoints?: number;
  activeStreak?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenNewGoal,
  totalPoints = 0,
  activeStreak = 0,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    setIsMenuOpen(false);
    if (!user && path !== '/') {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    } else {
      router.push(path);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md text-white select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: 3 Horizontal Lines Icon (Menu) */}
        <div className="relative flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
            aria-label="Navigation Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Section Dropdown */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl glass-panel bg-black/95 border border-white/15 p-2 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Switch Section
                </div>
                <button
                  onClick={() => handleNav('/goals-habits')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer group"
                >
                  <Layers className="h-4 w-4 text-white/50 group-hover:text-white stroke-[1.5]" />
                  <div>
                    <div className="font-semibold text-white">Tracking & Goals</div>
                    <div className="text-[11px] text-white/40">Goal &rarr; Plan &rarr; Task hierarchy</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNav('/time-blocking')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer group"
                >
                  <Calendar className="h-4 w-4 text-white/50 group-hover:text-white stroke-[1.5]" />
                  <div>
                    <div className="font-semibold text-white">Time-blocking</div>
                    <div className="text-[11px] text-white/40">Hourly schedule & calendar</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNav('/journal')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer group"
                >
                  <BookOpen className="h-4 w-4 text-white/50 group-hover:text-white stroke-[1.5]" />
                  <div>
                    <div className="font-semibold text-white">Reflection Journal</div>
                    <div className="text-[11px] text-white/40">Daily insights & notes</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNav('/daily-check-in')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer group"
                >
                  <Flame className="h-4 w-4 text-white/50 group-hover:text-white stroke-[1.5]" />
                  <div>
                    <div className="font-semibold text-white">Daily Check-In</div>
                    <div className="text-[11px] text-white/40">Mood, reflection & streak log</div>
                  </div>
                </button>
                <button
                  onClick={() => handleNav('/overview')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all text-left cursor-pointer group border-t border-white/10 mt-1 pt-2.5"
                >
                  <TrendingUp className="h-4 w-4 text-white/50 group-hover:text-white stroke-[1.5]" />
                  <div>
                    <div className="font-semibold text-white">Consistency Trends</div>
                    <div className="text-[11px] text-white/40">Heatmap & effort overview</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Center: White Ziffy Logo (links to Home) */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer focus:outline-none hover:opacity-80 transition-opacity"
            title="Go to Home"
          >
            <ZiffyLogo size="md" />
          </button>
        </div>

        {/* Right: Streak & Points, New Goal CTA, User Avatar & Logout */}
        <div className="flex items-center gap-3">
          {/* Streak & Points Tile */}
          <div className="hidden sm:flex items-center gap-2.5 glass-panel px-3.5 py-1.5 rounded-full text-xs">
            <div className="flex items-center gap-1 text-white font-semibold">
              <Flame className="h-3.5 w-3.5 fill-white text-white" />
              <span>{activeStreak}d streak</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="text-white/80 font-medium">
              <span className="font-bold text-white">{totalPoints}</span> pts
            </div>
          </div>

          {/* New Goal Modal Trigger */}
          {onOpenNewGoal && (
            <button
              onClick={onOpenNewGoal}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Goal</span>
            </button>
          )}

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div
                title={`Logged in as ${user.name || user.email}`}
                className="relative flex items-center justify-center h-8 w-8 rounded-full bg-white/10 border border-white/20 shadow-xs"
              >
                <span className="text-xs font-bold text-white font-mono">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-black" />
              </div>
              <button
                onClick={() => logout()}
                title="Sign out"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
