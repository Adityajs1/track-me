'use client';

import React from 'react';
import { ZiffyLogo } from './ZiffyLogo';
import {
  TrendingUp,
  Calendar,
  Layers,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* 1. Header Navigation (Left links, Center Logo, Right CTA) */}
      <header className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10">
        <div className="grid grid-cols-3 items-center">
          {/* Left Navigation */}
          <nav className="flex items-center gap-6 text-xs text-white/50 font-medium">
            <button
              onClick={onGetStarted}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Tracking
            </button>
            <button
              onClick={onGetStarted}
              className="hover:text-white transition-colors cursor-pointer hidden sm:inline-block"
            >
              Time-blocking
            </button>
            <button
              onClick={onGetStarted}
              className="hover:text-white transition-colors cursor-pointer hidden md:inline-block"
            >
              Journal
            </button>
          </nav>

          {/* Center Brand */}
          <div className="flex justify-center">
            <button onClick={onGetStarted} className="cursor-pointer focus:outline-none">
              <ZiffyLogo size="md" />
            </button>
          </div>

          {/* Right Action */}
          <div className="flex justify-end">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 transition-all cursor-pointer shadow-sm"
            >
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Substantially Enlarged Typography */}
      <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-24 text-center flex-1 flex flex-col justify-center">
        {/* Main Headline (Substantially Enlarged) */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tight text-white max-w-5xl mx-auto leading-[0.98] sm:leading-[1.02]">
          Organise you way with Ziffy
        </h1>

        {/* Punchy Subtitle */}
        <p className="mt-8 text-base sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-normal">
          A personal productivity system designed to track progress per goal over time. Effort shows as a visible trend, never daily pass or fail.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Open workspace</span>
            <ChevronRight className="h-4 w-4 stroke-[2]" />
          </button>
        </div>

        {/* 3. Four Significantly Enlarged Symmetrical Cards (2x2 Grid) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto w-full">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
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
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
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
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
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
          </div>

          {/* Card 4 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
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
          </div>
        </div>
      </main>

      {/* 4. Minimalist Monochrome Footer */}
      <footer className="mx-auto w-full max-w-7xl px-6 py-8 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
        <span>ziffy.</span>
        <span>Zero hardcoded data · 100% user-driven</span>
      </footer>
    </div>
  );
};
