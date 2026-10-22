import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { format, startOfDay, endOfDay, subDays, eachDayOfInterval } from 'date-fns';
import { ProductivityDayData, ProductivityOverviewData } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get('days') || '90', 10);
    const daysCount = Math.min(Math.max(daysParam, 30), 365);

    const today = startOfDay(new Date());
    const startDate = subDays(today, daysCount - 1);
    const intervalDays = eachDayOfInterval({ start: startDate, end: today });

    // 1. Fetch completed goals for this user in range
    const completedGoals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
        completedAt: {
          gte: startDate,
          lte: endOfDay(today),
        },
      },
      select: {
        id: true,
        name: true,
        completedAt: true,
      },
    });

    // 2. Fetch completed habits / task instances for this user in range
    const completedInstances = await prisma.taskInstance.findMany({
      where: {
        task: {
          goal: {
            userId: user.id,
          },
        },
        done: true,
        date: {
          gte: startDate,
          lte: endOfDay(today),
        },
      },
      select: {
        id: true,
        date: true,
      },
    });

    // 3. Fetch daily check-ins for this user in range
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endOfDay(today),
        },
      },
      select: {
        id: true,
        date: true,
        energy: true,
        mood: true,
      },
    });

    // Group by Date string (YYYY-MM-DD)
    const goalsByDate = new Map<string, number>();
    completedGoals.forEach((g) => {
      if (g.completedAt) {
        const dStr = format(new Date(g.completedAt), 'yyyy-MM-dd');
        goalsByDate.set(dStr, (goalsByDate.get(dStr) || 0) + 1);
      }
    });

    const habitsByDate = new Map<string, number>();
    completedInstances.forEach((inst) => {
      const dStr = format(new Date(inst.date), 'yyyy-MM-dd');
      habitsByDate.set(dStr, (habitsByDate.get(dStr) || 0) + 1);
    });

    const checkInsByDate = new Set<string>();
    checkIns.forEach((c) => {
      const dStr = format(new Date(c.date), 'yyyy-MM-dd');
      checkInsByDate.add(dStr);
    });

    // Assemble daily records
    let totalEvents = 0;
    const days: ProductivityDayData[] = [];

    intervalDays.forEach((day) => {
      const dStr = format(day, 'yyyy-MM-dd');
      const goalsCompletedCount = goalsByDate.get(dStr) || 0;
      const habitsCompletedCount = habitsByDate.get(dStr) || 0;
      const hasCheckIn = checkInsByDate.has(dStr);

      const dayEvents = goalsCompletedCount + habitsCompletedCount + (hasCheckIn ? 1 : 0);
      totalEvents += dayEvents;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (dayEvents === 0) intensity = 0;
      else if (dayEvents === 1) intensity = 1;
      else if (dayEvents === 2) intensity = 2;
      else if (dayEvents <= 4) intensity = 3;
      else intensity = 4;

      days.push({
        date: dStr,
        totalEvents: dayEvents,
        goalsCompletedCount,
        habitsCompletedCount,
        hasCheckIn,
        intensity,
      });
    });

    // Calculate streaks
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].totalEvents > 0) {
        currentStreak++;
      } else {
        // If today has 0 events so far, don't break yesterday's streak yet
        if (i === days.length - 1) {
          continue;
        }
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    days.forEach((day) => {
      if (day.totalEvents > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    const overview: ProductivityOverviewData = {
      totalEvents,
      currentStreak,
      longestStreak,
      totalGoalsCompleted: completedGoals.length,
      totalHabitCompletions: completedInstances.length,
      totalCheckIns: checkIns.length,
      days,
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Failed to compute productivity heatmap:', error);
    return NextResponse.json({ error: 'Failed to compute productivity heatmap' }, { status: 500 });
  }
}
