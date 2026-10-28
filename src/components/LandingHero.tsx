'use client';

import React from 'react';
import { ZiffyLogo } from './ZiffyLogo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  TrendingUp,
  Calendar,
  Layers,
  BookOpen,
  ArrowRight,
  ChevronRight,
  LogIn,
  LogOut,
} from 'lucide-react';

interface LandingHeroProps {
  onGetStarted?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleOpenWorkspace = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      router.push(user ? '/overview' : '/login?redirect=/overview');
    }
  };

  const handleNav = (path: string) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    } else {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* 1. Header Navigation */}
      <header className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-10 sm:py-7">
        <div className="flex items-center justify-between">
          {/* Left: Brand with Orange Substack color text (#FF6719) */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none group transition-opacity hover:opacity-90"
          >
            <ZiffyLogo size="md" color="text-[#FF6719]" />
          </button>

          {/* Right Action: Log In button (if logged out) or Logged In Icon indicator (if logged in) */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => router.push('/overview')}
                  title={`Logged in as ${user.name || user.email} · Open workspace`}
                  className="relative flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all cursor-pointer focus:outline-none group shadow-xs"
                >
                  <span className="text-xs font-bold text-white font-mono">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </span>
                  {/* Presence indicator showing active logged-in state */}
                  <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                </button>

                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="h-3.5 w-3.5 stroke-[2]" />
                <span>Log in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Substantially Enlarged Typography */}
      <main className="mx-auto w-full max-w-7xl px-6 pt-6 pb-16 sm:pt-10 sm:pb-20 text-center flex-1 flex flex-col justify-start sm:justify-center">
        {/* Main Headline (Substantially Enlarged) */}
        <h1
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight text-white max-w-5xl mx-auto leading-[0.98] sm:leading-[1.02]"
        >
          Organise your way with Ziffy
        </h1>

        {/* Punchy Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-normal">
          A personal productivity system designed to track progress per goal over time. Effort shows as a visible trend, never daily pass or fail.
        </p>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handleOpenWorkspace}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{user ? 'Open workspace' : 'Log in to workspace'}</span>
            <ChevronRight className="h-4 w-4 stroke-[2]" />
          </button>
        </div>

        {/* 3. Four Significantly Enlarged Symmetrical Cards (2x2 Grid) */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto w-full">
          {/* Card 1 */}
          <div
            onClick={() => handleNav('/overview')}
            className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-white/30 tracking-widest">01</span>
                <TrendingUp className="h-5 w-5 text-white/80 stroke-[1.25]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Consistency Trends
              </h3>
              <p className="text-sm text-white/50 mt-3 leading-relaxed">
                GitHub-contributions-style heatmaps computed dynamically from your completion percentage. Resting days never count as missed effort.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white">
              <span>View Heatmap</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => handleNav('/time-blocking')}
            className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-white/30 tracking-widest">02</span>
                <Calendar className="h-5 w-5 text-white/80 stroke-[1.25]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Time-Blocking
              </h3>
              <p className="text-sm text-white/50 mt-3 leading-relaxed">
                Turn open intentions into concrete commitments by assigning tasks and habits directly to hourly time slots on your day schedule.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white">
              <span>Open Calendar</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => handleNav('/goals-habits')}
            className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-white/30 tracking-widest">03</span>
                <Layers className="h-5 w-5 text-white/80 stroke-[1.25]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Goal &rarr; Plan &rarr; Task
              </h3>
              <p className="text-sm text-white/50 mt-3 leading-relaxed">
                A clean 3-level hierarchy with custom categories and optional time-boxed phases. Everything is authored and structured entirely by you.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white">
              <span>Manage Goals</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => handleNav('/journal')}
            className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-white/30 tracking-widest">04</span>
                <BookOpen className="h-5 w-5 text-white/80 stroke-[1.25]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Reflection Journal
              </h3>
              <p className="text-sm text-white/50 mt-3 leading-relaxed">
                A lightweight reflection journal for insights, obstacle notes, and breakthroughs—scoped to individual goals or written generally.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white">
              <span>Open Journal</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </main>

      {/* 4. Minimalist Monochrome Footer */}
      <footer className="mx-auto w-full max-w-7xl px-6 py-8 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
        <span className="text-[#FF6719] font-medium">ziffy<span className="opacity-50">.</span></span>
        <span>Zero hardcoded data · 100% user-driven</span>
      </footer>
    </div>
  );
};
