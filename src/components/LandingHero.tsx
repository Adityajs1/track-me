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
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* 1. Header Navigation (Left links, Center Logo, Right CTA) */}
      <header className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid grid-cols-3 items-center">
          {/* Left Navigation */}
          <nav className="flex items-center gap-6 text-xs text-white/60 font-medium">
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
              className="group flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Content */}
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24 text-center flex-1 flex flex-col justify-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.08]">
          Organise you way with Ziffy
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base text-white/50 max-w-xl mx-auto leading-relaxed font-normal">
          A personal productivity system designed to track progress per goal over time, replacing daily pass/fail pressure with clear consistency trends.
        </p>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-white/90 transition-all cursor-pointer"
          >
            <span>Open workspace</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3. Four Minimalist Feature Cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {/* Card 1 */}
          <div className="group rounded-xl border border-[#222222] bg-[#141414] p-5 hover:border-[#383838] transition-colors">
            <div className="flex items-center justify-between mb-3 text-white/40">
              <span className="text-[11px] font-mono text-white/30">01</span>
              <TrendingUp className="h-4 w-4 text-white/70" />
            </div>
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Consistency Trends
            </h3>
            <p className="text-[11px] text-white/40 mt-1 leading-normal">
              Heatmaps computed from completion rate. Rest days never count as misses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-xl border border-[#222222] bg-[#141414] p-5 hover:border-[#383838] transition-colors">
            <div className="flex items-center justify-between mb-3 text-white/40">
              <span className="text-[11px] font-mono text-white/30">02</span>
              <Calendar className="h-4 w-4 text-white/70" />
            </div>
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Time-Blocking
            </h3>
            <p className="text-[11px] text-white/40 mt-1 leading-normal">
              Place tasks onto concrete hour slots on your day schedule.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-xl border border-[#222222] bg-[#141414] p-5 hover:border-[#383838] transition-colors">
            <div className="flex items-center justify-between mb-3 text-white/40">
              <span className="text-[11px] font-mono text-white/30">03</span>
              <Layers className="h-4 w-4 text-white/70" />
            </div>
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Goal &rarr; Plan &rarr; Task
            </h3>
            <p className="text-[11px] text-white/40 mt-1 leading-normal">
              Three-level structure with user-defined categories and optional phases.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group rounded-xl border border-[#222222] bg-[#141414] p-5 hover:border-[#383838] transition-colors">
            <div className="flex items-center justify-between mb-3 text-white/40">
              <span className="text-[11px] font-mono text-white/30">04</span>
              <BookOpen className="h-4 w-4 text-white/70" />
            </div>
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Reflection Journal
            </h3>
            <p className="text-[11px] text-white/40 mt-1 leading-normal">
              Goal-scoped and general notes to capture insights and adjustments.
            </p>
          </div>
        </div>
      </main>

      {/* 4. Minimal Footer */}
      <footer className="mx-auto w-full max-w-6xl px-6 py-6 border-t border-[#1F1F1F] flex items-center justify-between text-[11px] text-white/30">
        <span>ziffy.</span>
        <span>Effort as a trend</span>
      </footer>
    </div>
  );
};
