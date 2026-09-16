'use client';

import React, { useState } from 'react';
import { ZiffyLogo } from './ZiffyLogo';
import {
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Flame,
  Clock,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showCookiePill, setShowCookiePill] = useState(true);

  return (
    <div className="relative min-h-screen bg-[#1B1B1B] text-white flex flex-col justify-between selection:bg-[#FF4FA3] selection:text-white overflow-hidden">
      {/* Background Atmospheric Glow Gradients (Bubblegum Pop #FF4FA3 & #00C2CB) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-[#FF4FA3]/15 via-[#00C2CB]/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-48 h-96 w-96 rounded-full bg-[#00C2CB]/10 blur-3xl" />
        <div className="absolute top-1/2 -right-48 h-96 w-96 rounded-full bg-[#FF4FA3]/10 blur-3xl" />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* 1. Header & Navigation (micro1 Layout: Left links, Center Logo, Right CTA) */}
      <header className="relative z-20 mx-auto w-full max-w-7xl px-6 py-6 sm:px-8">
        <div className="grid grid-cols-3 items-center">
          {/* Left: Navigation Menu */}
          <nav className="flex items-center gap-6 text-sm text-[#FFFFFF]/80 font-normal">
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'features' ? null : 'features')}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <span>Features</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>

              {activeMenu === 'features' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-[#2E2E2E] bg-[#232323]/95 p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1B1B1B] transition-colors">
                      <TrendingUp className="h-4 w-4 text-[#00C2CB]" />
                      <div>
                        <div className="text-xs font-semibold text-white">Consistency Heatmaps</div>
                        <div className="text-[11px] text-zinc-400">Effort as visual trends</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1B1B1B] transition-colors">
                      <Calendar className="h-4 w-4 text-[#FF4FA3]" />
                      <div>
                        <div className="text-xs font-semibold text-white">Time-Blocking</div>
                        <div className="text-[11px] text-zinc-400">Hourly day scheduling</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1B1B1B] transition-colors">
                      <Target className="h-4 w-4 text-[#00C2CB]" />
                      <div>
                        <div className="text-xs font-semibold text-white">Goal → Plan → Task</div>
                        <div className="text-[11px] text-zinc-400">Structured time-boxed phases</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onGetStarted}
              className="hidden md:inline-block hover:text-white transition-colors cursor-pointer"
            >
              Heatmaps
            </button>
            <button
              onClick={onGetStarted}
              className="hidden lg:inline-block hover:text-white transition-colors cursor-pointer"
            >
              Time-blocking
            </button>
            <button
              onClick={onGetStarted}
              className="hidden xl:inline-block hover:text-white transition-colors cursor-pointer"
            >
              Journal
            </button>
          </nav>

          {/* Center: Brand Name & Owl Logo Mark */}
          <div className="flex justify-center">
            <button onClick={onGetStarted} className="cursor-pointer focus:outline-none">
              <ZiffyLogo size="md" />
            </button>
          </div>

          {/* Right: Get Started Action Button with dark arrow box (matching micro1) */}
          <div className="flex justify-end">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1B1B1B] hover:bg-[#FF4FA3] hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
            >
              <span>Get started</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1B1B1B] text-white group-hover:bg-white group-hover:text-[#1B1B1B] transition-colors">
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Large Centered Headline */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 sm:py-20 text-center flex-1 flex flex-col justify-center">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2E2E2E] bg-[#232323]/80 px-4 py-1.5 text-xs font-medium text-white/90 mb-8 mx-auto shadow-xs backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#00C2CB] animate-pulse" />
          <span>Next-Gen Goal & Habit Consistency System</span>
          <span className="text-[#FF4FA3] font-bold">· No Daily Pass/Fail</span>
        </div>

        {/* Main Headline (Exact requested text) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] sm:leading-[1.1]">
          Organise you way with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] via-[#00C2CB] to-white">Ziffy</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-[#FFFFFF]/75 max-w-2xl mx-auto leading-relaxed font-normal">
          A personal system for planning, tracking, and actually finishing what you set out to do. Effort shows as a visible trend rather than daily pass/fail anxiety.
        </p>

        {/* CTA Buttons with Bubblegum Pop Palette */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#FF4FA3] px-8 py-3.5 text-sm font-bold text-[#1B1B1B] shadow-lg shadow-[#FF4FA3]/25 hover:bg-white hover:text-[#1B1B1B] transition-all duration-200 cursor-pointer"
          >
            <span>Start Tracking with Ziffy</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#00C2CB]/60 bg-[#232323]/60 px-7 py-3.5 text-sm font-medium text-[#00C2CB] hover:bg-[#00C2CB]/10 transition-colors cursor-pointer"
          >
            <Zap className="h-4 w-4 text-[#00C2CB]" />
            <span>Explore Demo Data</span>
          </button>
        </div>

        {/* 4 Feature Columns with Bubblegum Pop styling */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Feature 1 */}
          <div className="group rounded-2xl border border-[#2E2E2E] bg-[#232323]/70 p-5 backdrop-blur-xs hover:border-[#00C2CB]/60 transition-all duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B1B1B] text-[#00C2CB] border border-[#2E2E2E] mb-4 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Consistency Heatmaps</h3>
            <p className="text-xs text-[#FFFFFF]/60 mt-1.5 leading-relaxed">
              GitHub-style color tiers (≥80% dark green, 30–80% yellow, &lt;30% red). Resting days never penalize.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-2xl border border-[#2E2E2E] bg-[#232323]/70 p-5 backdrop-blur-xs hover:border-[#FF4FA3]/60 transition-all duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B1B1B] text-[#FF4FA3] border border-[#2E2E2E] mb-4 group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Time-Blocking</h3>
            <p className="text-xs text-[#FFFFFF]/60 mt-1.5 leading-relaxed">
              Place tasks onto concrete hour slots on your schedule, turning intention into execution.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-2xl border border-[#2E2E2E] bg-[#232323]/70 p-5 backdrop-blur-xs hover:border-[#00C2CB]/60 transition-all duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B1B1B] text-[#00C2CB] border border-[#2E2E2E] mb-4 group-hover:scale-105 transition-transform">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Goal → Plan → Task</h3>
            <p className="text-xs text-[#FFFFFF]/60 mt-1.5 leading-relaxed">
              User-defined categories and optional time-boxed phases for structured long-term objectives.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group rounded-2xl border border-[#2E2E2E] bg-[#232323]/70 p-5 backdrop-blur-xs hover:border-[#FF4FA3]/60 transition-all duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B1B1B] text-[#FF4FA3] border border-[#2E2E2E] mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Reflection Journal</h3>
            <p className="text-xs text-[#FFFFFF]/60 mt-1.5 leading-relaxed">
              Goal-scoped and general reflection entries to record insights, breakthroughs, and adjustments.
            </p>
          </div>
        </div>
      </main>

      {/* 3. Bottom Floating Pill (Inspired by micro1 cookie/status pill) */}
      {showCookiePill && (
        <div className="relative z-30 pb-6 px-4 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-[#2E2E2E] bg-[#232323]/95 px-5 py-2.5 text-xs text-white/90 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#FF4FA3]" />
              <span>Ready to experience calm productivity?</span>
            </div>

            <button
              onClick={onGetStarted}
              className="rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#1B1B1B] hover:bg-[#00C2CB] hover:text-white transition-colors cursor-pointer"
            >
              Open App
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
