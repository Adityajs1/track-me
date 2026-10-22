'use client';

import React from 'react';
import { ZiffyLogo } from './ZiffyLogo';
import { LayoutDashboard, Target, CheckCircle2, Calendar, BookOpen, Flame, Plus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavbarProps {
  onOpenNewGoal?: () => void;
  totalPoints?: number;
  activeStreak?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewGoal,
  totalPoints = 0,
  activeStreak = 0,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Tracking', href: '/', icon: LayoutDashboard, isActive: pathname === '/' },
    { name: 'Goals & Habits', href: '/goals-habits', icon: Target, isActive: pathname.startsWith('/goals') },
    { name: 'Daily Check-in', href: '/daily-check-in', icon: CheckCircle2, isActive: pathname.startsWith('/daily-check-in') || pathname.startsWith('/check') },
    { name: 'Time-blocking', href: '/time-blocking', icon: Calendar, isActive: pathname.startsWith('/time-blocking') || pathname.startsWith('/timeblocking') },
    { name: 'Journal', href: '/journal', icon: BookOpen, isActive: pathname.startsWith('/journal') || pathname.startsWith('/notes') },
  ];

  const handleNav = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user && href !== '/') {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md text-white select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 cursor-pointer focus:outline-none">
            <ZiffyLogo size="sm" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={(e) => handleNav(link.href, e)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    link.isActive
                      ? 'bg-white text-black shadow-xs'
                      : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Streak, Points & New Goal */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 glass-panel px-3.5 py-1.5 rounded-full text-xs">
            <div className="flex items-center gap-1 text-[#FF4FA3] font-semibold">
              <Flame className="h-3.5 w-3.5 fill-[#FF4FA3]" />
              <span>{activeStreak}d streak</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="text-white/80 font-medium">
              <span className="font-bold text-[#00C2CB]">{totalPoints}</span> pts
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {onOpenNewGoal && (
                <button
                  onClick={onOpenNewGoal}
                  className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-white/90 text-black px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>New Goal</span>
                </button>
              )}
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
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

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-white/10 px-4 py-2 gap-2 overflow-x-auto bg-[#0A0A0A]">
        {navLinks.map((link) => (
          <button
            key={link.href}
            onClick={(e) => handleNav(link.href, e)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap cursor-pointer ${
              link.isActive
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>{link.name}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
