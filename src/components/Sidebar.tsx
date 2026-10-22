'use client';

import React from 'react';
import { GoalData } from '@/lib/types';
import { ZiffyLogo } from './ZiffyLogo';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Target,
  CheckCircle2,
  Calendar,
  BookOpen,
  Plus,
  Flame,
  LogOut,
  LogIn,
  Award,
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  goals: GoalData[];
  selectedGoalId?: string | null;
  onSelectGoal?: (goal: GoalData) => void;
  onOpenNewGoal: () => void;
  onOpenLanding?: () => void;
  totalPoints: number;
  activeStreak: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  goals,
  selectedGoalId,
  onSelectGoal,
  onOpenNewGoal,
  onOpenLanding,
  totalPoints,
  activeStreak,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview & Heatmap',
      href: '/',
      icon: LayoutDashboard,
      isActive: pathname === '/',
    },
    {
      name: 'Goals & Habits',
      href: '/goals-habits',
      icon: Target,
      badge: goals.length,
      isActive: pathname.startsWith('/goals'),
    },
    {
      name: 'Daily Check-In',
      href: '/daily-check-in',
      icon: CheckCircle2,
      isActive: pathname.startsWith('/daily-check-in') || pathname.startsWith('/check'),
    },
    {
      name: 'Time-Blocking',
      href: '/time-blocking',
      icon: Calendar,
      isActive: pathname.startsWith('/time-blocking') || pathname.startsWith('/timeblocking'),
    },
    {
      name: 'Journal & Notes',
      href: '/journal',
      icon: BookOpen,
      isActive: pathname.startsWith('/journal') || pathname.startsWith('/notes'),
    },
  ];

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user && href !== '/') {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-white select-none">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-1 py-1">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer focus:outline-none"
          >
            <ZiffyLogo size="sm" />
          </Link>
        </div>

        {/* Core Navigation Views (Each links to its distinct dedicated route) */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  item.isActive
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 stroke-[1.5] shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      item.isActive
                        ? 'bg-black/10 text-black'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {!user && item.href !== '/' && (
                  <span className="text-[9px] px-1 rounded bg-white/10 text-white/40 font-mono">
                    Auth
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Goals List (Links to Goal detail view under Goals & Habits) */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-white/40">
            <span>Your Goals</span>
            <button
              onClick={onOpenNewGoal}
              className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Add a new goal"
            >
              <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="px-2 py-3 text-[11px] text-white/30 leading-normal">
              Clean state. Click &ldquo;+&rdquo; or create a goal to begin.
            </div>
          ) : (
            <div className="space-y-1">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (onSelectGoal) onSelectGoal(g);
                    router.push(`/goals-habits?goal=${g.id}`);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                    selectedGoalId === g.id
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        g.isCompleted ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                    <span className="truncate">{g.name}</span>
                  </div>
                  <span className="text-[10px] text-white/30 truncate ml-1 font-mono">
                    {g.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Stats, User Profile & New Goal Action */}
      <div className="p-4 border-t border-white/10 bg-[#0A0A0A] space-y-3">
        {/* Streak & Points Tile */}
        <div className="flex items-center justify-between glass-panel px-3.5 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Flame className="h-3.5 w-3.5 stroke-[1.5] text-white" />
            <span>{activeStreak}d streak</span>
          </div>
          <div className="text-white/50 text-[11px] font-mono">
            <span className="font-semibold text-white">{totalPoints}</span> pts
          </div>
        </div>

        {/* User Account / Auth Section */}
        {user ? (
          <div className="flex items-center justify-between glass-panel px-3 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] shrink-0">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="truncate">
                <div className="font-semibold truncate text-[11px] text-white">
                  {user.name || 'User'}
                </div>
                <div className="text-[9px] text-white/40 truncate font-mono">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-3 py-2 text-xs font-medium transition-all cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={onOpenNewGoal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/90 text-black px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2]" />
          <span>New Goal</span>
        </button>
      </div>
    </aside>
  );
};
